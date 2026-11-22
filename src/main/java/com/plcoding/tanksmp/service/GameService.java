package com.plcoding.tanksmp.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.plcoding.tanksmp.controllers.dto.AimUpdateCommand;
import com.plcoding.tanksmp.controllers.dto.JoinMatchResponse;
import com.plcoding.tanksmp.controllers.dto.MatchEvent;
import com.plcoding.tanksmp.controllers.dto.TurnCommand;
import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.engine.CloudGenerator;
import com.plcoding.tanksmp.engine.EngineConstants;
import com.plcoding.tanksmp.engine.TankPlacement;
import com.plcoding.tanksmp.engine.TerrainGenerator;
import com.plcoding.tanksmp.engine.TurnResolver;
import com.plcoding.tanksmp.engine.TurnResult;
import com.plcoding.tanksmp.exceptions.ForbiddenException;
import com.plcoding.tanksmp.exceptions.GameNotFoundException;
import com.plcoding.tanksmp.exceptions.InvalidGameStateException;
import com.plcoding.tanksmp.exceptions.InvalidRequestException;
import com.plcoding.tanksmp.model.Game;
import com.plcoding.tanksmp.model.GameStatus;
import com.plcoding.tanksmp.model.Player;
import com.plcoding.tanksmp.model.Tank;
import com.plcoding.tanksmp.model.constants.GameConstants;
import com.plcoding.tanksmp.model.keywords.ActionType;
import com.plcoding.tanksmp.model.keywords.ColorSchemas;
import com.plcoding.tanksmp.model.keywords.TankActionName;
import com.plcoding.tanksmp.model.tankActions.TankAction;
import com.plcoding.tanksmp.storage.GameStorage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Match rules. Every operation that reads or changes a match runs while holding that match's own
 * monitor, so concurrent joins, starts and turns on the same match are applied one at a time.
 * Callers only ever receive snapshots taken under that monitor, and events are published before
 * it is released, so events reach listeners in the order the state changed.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class GameService {

    /** A player's live aim updates are accepted at most this often; extras are dropped. */
    static final Duration MINIMUM_AIM_UPDATE_INTERVAL = Duration.ofMillis(50);

    private final GameStorage gameStorage;
    private final Random random;
    private final Clock clock;
    private final MatchEventPublisher matchEventPublisher;

    public Game initializeGame() {
        Game game = new Game();
        game.setGameId(UUID.randomUUID().toString());
        game.setGameStatus(GameStatus.NEW);
        game.setColorSchema(
                (random.nextBoolean() ? ColorSchemas.DAY_COLORS : ColorSchemas.DUSK_COLORS).toString());
        game.setCurrentPlayerIndex(0);
        game.setLastActivityAt(clock.instant());

        gameStorage.save(game);
        return game.snapshot();
    }

    /** Snapshot of the match as it is right now. */
    public Game getGame(String gameId) {
        Game requestedGame = findLiveGame(gameId);
        synchronized (requestedGame) {
            return requestedGame.snapshot();
        }
    }

    private Game findLiveGame(String gameId) {
        return gameStorage.findById(gameId)
                .orElseThrow(() -> new GameNotFoundException("A game with that ID does not exist."));
    }

    public JoinMatchResponse joinGame(String rawPlayerName, Integer requestedColor, String gameId) {
        Game requestedGame = findLiveGame(gameId);
        String playerName = rawPlayerName == null ? null : rawPlayerName.trim();
        validatePlayerName(playerName);
        validateRequestedColor(requestedColor);

        synchronized (requestedGame) {
            int currentPlayerCount = requestedGame.getPlayers().size();
            boolean gameFull = currentPlayerCount >= requestedGame.getMaxPlayerCount();
            boolean invalidGameStatus = requestedGame.getGameStatus() != GameStatus.NEW;
            if (gameFull || invalidGameStatus) {
                throw new InvalidGameStateException("Game is not currently accepting players.");
            }
            boolean playerNameTaken = requestedGame.getPlayers().stream()
                    .anyMatch(player -> player.getName().equals(playerName));
            if (playerNameTaken) {
                throw new InvalidRequestException("The given name is already taken for this game ID.");
            }
            boolean colorClaimed = !requestedGame.getClaimedColors()[requestedColor].isEmpty();
            if (colorClaimed) {
                throw new InvalidRequestException("That tank color has already been claimed.");
            }

            UUID playerToken = UUID.randomUUID();
            Player newPlayer = new Player(playerName, Tank.createDefault(requestedColor), currentPlayerCount, 0,
                    playerToken);
            requestedGame.getClaimedColors()[requestedColor] = playerName;
            requestedGame.getPlayers().add(newPlayer);
            if (requestedGame.getHostPlayerIndex() == null) {
                requestedGame.setHostPlayerIndex(currentPlayerCount);
            }
            recordActivity(requestedGame);

            Game snapshot = requestedGame.snapshot();
            matchEventPublisher.publish(MatchEvent.gameUpdated(snapshot));
            return new JoinMatchResponse(snapshot, currentPlayerCount, playerToken.toString());
        }
    }

    /** Starts the match: only the host may, and at least {@link GameConstants#MIN_PLAYERS} must have joined. */
    public Game startGame(String gameId, String playerToken) {
        Game requestedGame = findLiveGame(gameId);
        synchronized (requestedGame) {
            Player requestingPlayer = authenticate(requestedGame, playerToken);
            if (!requestingPlayer.getPlayerIndex().equals(requestedGame.getHostPlayerIndex())) {
                throw new ForbiddenException("Only the host can start the match.");
            }
            if (requestedGame.getGameStatus() != GameStatus.NEW) {
                throw new InvalidGameStateException("This game is already underway.");
            }
            int playerCount = requestedGame.getPlayers().size();
            if (playerCount < GameConstants.MIN_PLAYERS) {
                throw new InvalidGameStateException(
                        "At least " + GameConstants.MIN_PLAYERS + " players are needed to start.");
            }

            List<Point2D> topography = new TerrainGenerator(random).generate();
            List<Point2D> tankPositions = TankPlacement.generateTankPositions(topography, playerCount, random);
            for (int playerIndex = 0; playerIndex < playerCount; playerIndex++) {
                requestedGame.getPlayers().get(playerIndex).getTank().setPosition(tankPositions.get(playerIndex));
            }
            requestedGame.setTopography(new ArrayList<>(topography));
            requestedGame.setClouds(new CloudGenerator(random).generate());
            requestedGame.setCurrentPlayerIndex(0);
            requestedGame.setTurnNumber(0);
            requestedGame.setWinnerIndex(null);
            requestedGame.setGameStatus(GameStatus.IN_PROGRESS);
            recordActivity(requestedGame);

            Game snapshot = requestedGame.snapshot();
            matchEventPublisher.publish(MatchEvent.gameUpdated(snapshot));
            return snapshot;
        }
    }

    /** Plays the current player's turn. The returned event carries the updated match and how the turn played out. */
    public MatchEvent takeTurn(String gameId, TurnCommand command, String playerToken) {
        Game requestedGame = findLiveGame(gameId);
        synchronized (requestedGame) {
            Player actingPlayer = authenticate(requestedGame, playerToken);
            if (requestedGame.getGameStatus() != GameStatus.IN_PROGRESS) {
                throw new InvalidGameStateException("This game is not in progress.");
            }
            if (actingPlayer.getPlayerIndex() != requestedGame.getCurrentPlayerIndex()) {
                throw new InvalidGameStateException("It is not your turn.");
            }
            Tank actingTank = actingPlayer.getTank();
            validateCommand(command, actingTank);
            applyCommandToTank(command, actingTank);

            List<Tank> tanks = requestedGame.getPlayers().stream().map(Player::getTank).toList();
            TurnResult turnResult = TurnResolver.resolve(tanks, requestedGame.getTopography(),
                    actingPlayer.getPlayerIndex());

            requestedGame.setTopography(new ArrayList<>(turnResult.topographyAfter()));
            requestedGame.setCurrentPlayerIndex(turnResult.nextPlayerIndex());
            requestedGame.setTurnNumber(requestedGame.getTurnNumber() + 1);
            if (turnResult.winnerIndex() != null) {
                requestedGame.setWinnerIndex(turnResult.winnerIndex());
                requestedGame.setGameStatus(GameStatus.FINISHED);
            }
            recordActivity(requestedGame);

            MatchEvent turnEvent = MatchEvent.turnResolved(requestedGame.snapshot(), turnResult);
            matchEventPublisher.publish(turnEvent);
            return turnEvent;
        }
    }

    /**
     * Records the current player's live aim so other players can watch it. Display only: the turn
     * itself always uses the values sent with the turn command. Anything invalid, out of turn or
     * arriving faster than {@link #MINIMUM_AIM_UPDATE_INTERVAL} is dropped without any error.
     */
    public void updateAim(String gameId, AimUpdateCommand command) {
        Game requestedGame = gameStorage.findById(gameId).orElse(null);
        if (requestedGame == null || command == null) {
            log.debug("aim update dropped: unknown match or empty command");
            return;
        }
        synchronized (requestedGame) {
            Player aimingPlayer;
            try {
                aimingPlayer = authenticate(requestedGame, command.getPlayerToken());
            } catch (ForbiddenException invalidToken) {
                log.debug("aim update dropped for match {}: invalid token", gameId);
                return;
            }
            if (requestedGame.getGameStatus() != GameStatus.IN_PROGRESS
                    || aimingPlayer.getPlayerIndex() != requestedGame.getCurrentPlayerIndex()) {
                log.debug("aim update dropped for match {}: not in progress or not the player's turn", gameId);
                return;
            }
            if (!isValidAim(command)) {
                log.debug("aim update dropped for match {}: values out of range", gameId);
                return;
            }
            Instant now = clock.instant();
            Instant lastAcceptedAt = requestedGame.getLastAimAcceptedAtByPlayerIndex()
                    .get(aimingPlayer.getPlayerIndex());
            if (lastAcceptedAt != null && Duration.between(lastAcceptedAt, now).compareTo(
                    MINIMUM_AIM_UPDATE_INTERVAL) < 0) {
                log.debug("aim update dropped for match {}: rate limited", gameId);
                return;
            }
            requestedGame.getLastAimAcceptedAtByPlayerIndex().put(aimingPlayer.getPlayerIndex(), now);
            recordActivity(requestedGame);

            Tank aimingTank = aimingPlayer.getTank();
            aimingTank.setTurretAngle(command.getTurretAngle());
            aimingTank.setShotPower(command.getShotPower());
            aimingTank.setSelectedAction(command.getSelectedActionName());
            matchEventPublisher.publish(MatchEvent.aimUpdated(gameId, new MatchEvent.AimUpdate(
                    aimingPlayer.getPlayerIndex(), command.getTurretAngle(), command.getShotPower(),
                    command.getSelectedActionName())));
        }
    }

    private boolean isValidAim(AimUpdateCommand command) {
        Integer turretAngle = command.getTurretAngle();
        Integer shotPower = command.getShotPower();
        return command.getSelectedActionName() != null
                && turretAngle != null && turretAngle >= EngineConstants.MIN_TURRET_ANGLE
                && turretAngle <= EngineConstants.MAX_TURRET_ANGLE
                && shotPower != null && shotPower >= EngineConstants.MIN_SHOT_POWER
                && shotPower <= EngineConstants.MAX_SHOT_POWER;
    }

    private void recordActivity(Game game) {
        game.setLastActivityAt(clock.instant());
    }

    /** Finds the player owning the token; a missing, malformed or unknown token is forbidden. */
    private Player authenticate(Game game, String playerToken) {
        UUID parsedToken = parseToken(playerToken);
        return game.getPlayers().stream()
                .filter(player -> player.getPlayerToken().equals(parsedToken))
                .findFirst()
                .orElseThrow(() -> new ForbiddenException("The player token is not valid for this match."));
    }

    private UUID parseToken(String playerToken) {
        if (playerToken == null || playerToken.isBlank()) {
            throw new ForbiddenException("A player token is required.");
        }
        try {
            return UUID.fromString(playerToken.trim());
        } catch (IllegalArgumentException invalidToken) {
            throw new ForbiddenException("The player token is not valid for this match.");
        }
    }

    private void validateCommand(TurnCommand command, Tank actingTank) {
        if (command == null || command.getActionName() == null) {
            throw new InvalidRequestException("An action name is required.");
        }
        TankAction action = actingTank.getTankActions().findByName(command.getActionName());
        if (action.getType() == ActionType.DRIVE) {
            requireWithinRange("driveDistance", command.getDriveDistance(), -EngineConstants.MAX_DRIVE_DISTANCE,
                    EngineConstants.MAX_DRIVE_DISTANCE);
            return;
        }
        requireWithinRange("turretAngle", command.getTurretAngle(), EngineConstants.MIN_TURRET_ANGLE,
                EngineConstants.MAX_TURRET_ANGLE);
        requireWithinRange("shotPower", command.getShotPower(), EngineConstants.MIN_SHOT_POWER,
                EngineConstants.MAX_SHOT_POWER);
        Integer roundsLeft = actingTank.getRemainingRounds().get(action.getName());
        if (roundsLeft != null && roundsLeft <= 0) {
            throw new InvalidRequestException("No rounds left for " + action.getDisplayName() + ".");
        }
    }

    private void requireWithinRange(String fieldName, Integer value, int minimum, int maximum) {
        if (value == null || value < minimum || value > maximum) {
            throw new InvalidRequestException(
                    fieldName + " is required and must be between " + minimum + " and " + maximum + ".");
        }
    }

    private void applyCommandToTank(TurnCommand command, Tank actingTank) {
        TankActionName actionName = command.getActionName();
        actingTank.setSelectedAction(actionName);
        if (actingTank.getTankActions().findByName(actionName).getType() == ActionType.DRIVE) {
            actingTank.setDriveDistance(command.getDriveDistance());
        } else {
            actingTank.setTurretAngle(command.getTurretAngle());
            actingTank.setShotPower(command.getShotPower());
        }
    }

    private void validatePlayerName(String playerName) {
        if (playerName == null || playerName.isBlank()) {
            throw new InvalidRequestException("A player name is required.");
        }
        if (playerName.length() > GameConstants.MAX_PLAYER_NAME_LENGTH) {
            throw new InvalidRequestException(
                    "Player names can be at most " + GameConstants.MAX_PLAYER_NAME_LENGTH + " characters long.");
        }
    }

    private void validateRequestedColor(Integer requestedColor) {
        if (requestedColor == null || requestedColor < 0 || requestedColor >= GameConstants.MAX_PLAYERS) {
            throw new InvalidRequestException(
                    "The requested color must be between 0 and " + (GameConstants.MAX_PLAYERS - 1) + ".");
        }
    }
}
