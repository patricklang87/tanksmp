package com.plcoding.tanksmp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import static org.assertj.core.api.Assertions.within;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.function.IntFunction;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import com.plcoding.tanksmp.controllers.dto.JoinMatchResponse;
import com.plcoding.tanksmp.controllers.dto.MatchEvent;
import com.plcoding.tanksmp.controllers.dto.TurnCommand;
import com.plcoding.tanksmp.engine.EngineConstants;
import com.plcoding.tanksmp.engine.TerrainGeometry;
import com.plcoding.tanksmp.exceptions.ForbiddenException;
import com.plcoding.tanksmp.model.Tank;

import com.plcoding.tanksmp.exceptions.GameNotFoundException;
import com.plcoding.tanksmp.exceptions.InvalidGameStateException;
import com.plcoding.tanksmp.exceptions.InvalidRequestException;
import com.plcoding.tanksmp.model.Game;
import com.plcoding.tanksmp.model.GameStatus;
import com.plcoding.tanksmp.model.Player;
import com.plcoding.tanksmp.model.constants.GameConstants;
import com.plcoding.tanksmp.model.keywords.ColorSchemas;
import com.plcoding.tanksmp.model.keywords.TankActionName;
import com.plcoding.tanksmp.storage.GameStorage;

class GameServiceTest {

    private GameStorage gameStorage;
    private MutableClock clock;
    private GameService gameService;
    private Game game;
    private List<MatchEvent> recordedEvents;

    @BeforeEach
    void setUp() {
        gameStorage = new GameStorage();
        clock = new MutableClock(Instant.parse("2026-01-01T00:00:00Z"));
        recordedEvents = new CopyOnWriteArrayList<>();
        gameService = new GameService(gameStorage, new Random(42), clock, recordedEvents::add);
        // Tests inspect and arrange the live match directly; the service itself only hands out snapshots.
        game = gameStorage.findById(gameService.initializeGame().getGameId()).orElseThrow();
    }

    private JoinMatchResponse join(String name, int color) {
        return gameService.joinGame(name, color, game.getGameId());
    }

    private TurnCommand fireCommand(int turretAngle, int shotPower) {
        TurnCommand command = new TurnCommand();
        command.setActionName(TankActionName.STANDARD_SHOT);
        command.setTurretAngle(turretAngle);
        command.setShotPower(shotPower);
        return command;
    }

    /** Two players joined and the match started; returns their tokens in join order. */
    private List<String> startTwoPlayerMatch() {
        String hostToken = join("alice", 0).playerToken();
        String guestToken = join("bob", 1).playerToken();
        gameService.startGame(game.getGameId(), hostToken);
        return List.of(hostToken, guestToken);
    }

    @Test
    void initializeGameCreatesAndStoresANewGame() {
        assertThat(game.getGameId()).isNotBlank();
        assertThat(game.getHostPlayerIndex()).isNull();
        assertThat(game.getWinnerIndex()).isNull();
        assertThat(game.getTurnNumber()).isZero();
        assertThat(game.getLastActivityAt()).isEqualTo(clock.instant());
        assertThat(game.getGameStatus()).isEqualTo(GameStatus.NEW);
        assertThat(game.getPlayers()).isEmpty();
        assertThat(game.getColorSchema()).isIn(
                ColorSchemas.DAY_COLORS.toString(), ColorSchemas.DUSK_COLORS.toString());
        assertThat(gameStorage.findById(game.getGameId())).contains(game);
    }

    @Test
    void joinGameAddsPlayerWithFreshTankAndClaimsColor() throws Exception {
        JoinMatchResponse response = join("alice", 2);
        Game joined = response.game();

        assertThat(response.playerIndex()).isZero();
        assertThat(response.playerToken()).isNotBlank();
        assertThat(joined.getHostPlayerIndex()).isZero();
        assertThat(joined.getPlayers()).hasSize(1);
        Player player = joined.getPlayers().get(0);
        assertThat(player.getName()).isEqualTo("alice");
        assertThat(player.getPlayerIndex()).isZero();
        assertThat(player.getTank().getShields()).isEqualTo(100);
        assertThat(player.getTank().getColorIndex()).isEqualTo(2);
        assertThat(player.getTank().getSelectedAction()).isEqualTo(TankActionName.STANDARD_SHOT);
        assertThat(joined.getClaimedColors()[2]).isEqualTo("alice");

        JoinMatchResponse secondResponse = join("bob", 3);
        assertThat(secondResponse.playerIndex()).isEqualTo(1);
        assertThat(secondResponse.playerToken()).isNotEqualTo(response.playerToken());
        assertThat(joined.getHostPlayerIndex()).isZero();
    }

    @Test
    void joinGameRejectsUnknownGame() {
        assertThatThrownBy(() -> gameService.joinGame("alice", 0, "no-such-game"))
                .isInstanceOf(GameNotFoundException.class);
    }

    @Test
    void joinGameRejectsDuplicateName() throws Exception {
        gameService.joinGame("alice", 0, game.getGameId());

        assertThatThrownBy(() -> gameService.joinGame("alice", 1, game.getGameId()))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("already taken");
    }

    @Test
    void joinGameRejectsPlayersOnceFull() throws Exception {
        for (int i = 0; i < game.getMaxPlayerCount(); i++) {
            join("player" + i, i);
        }

        assertThatThrownBy(() -> gameService.joinGame("late", 0, game.getGameId()))
                .isInstanceOf(InvalidGameStateException.class);
    }

    @Test
    void joinGameRejectsPlayersAfterStart() throws Exception {
        String hostToken = join("alice", 0).playerToken();
        join("bob", 1);
        gameService.startGame(game.getGameId(), hostToken);

        assertThatThrownBy(() -> gameService.joinGame("carol", 2, game.getGameId()))
                .isInstanceOf(InvalidGameStateException.class);
    }

    @Test
    void startGameMovesGameInProgressOnlyOnce() {
        String hostToken = join("alice", 0).playerToken();
        join("bob", 1);

        Game started = gameService.startGame(game.getGameId(), hostToken);
        assertThat(started.getGameStatus()).isEqualTo(GameStatus.IN_PROGRESS);

        assertThatThrownBy(() -> gameService.startGame(game.getGameId(), hostToken))
                .isInstanceOf(InvalidGameStateException.class);
    }

    @Test
    void startGamePlacesOneTankPerPlayerOnTheTerrain() {
        startTwoPlayerMatch();

        assertThat(game.getTopography()).isNotEmpty();
        assertThat(game.getClouds()).isNotNull();
        assertThat(game.getCurrentPlayerIndex()).isZero();
        assertThat(game.getPlayers()).hasSize(2);
        game.getPlayers().forEach(player -> {
            Tank tank = player.getTank();
            assertThat(tank.getPosition()).isNotNull();
            double terrainHeightBeneathTank = TerrainGeometry.heightAt(game.getTopography(),
                    tank.getPosition().getX() + GameConstants.TANK_WIDTH / 2.0);
            assertThat((double) (tank.getPosition().getY() + GameConstants.TANK_HEIGHT))
                    .isCloseTo(terrainHeightBeneathTank, within(0.01));
        });
        assertThat(game.getPlayers().get(0).getTank().getPosition().getX())
                .isLessThan(game.getPlayers().get(1).getTank().getPosition().getX());
    }

    @Test
    void startGameRejectsANonHostPlayerWithForbidden() {
        join("alice", 0);
        String guestToken = join("bob", 1).playerToken();

        assertThatThrownBy(() -> gameService.startGame(game.getGameId(), guestToken))
                .isInstanceOf(ForbiddenException.class);
        assertThat(game.getGameStatus()).isEqualTo(GameStatus.NEW);
    }

    @Test
    void startGameRejectsMissingOrUnknownTokenWithForbidden() {
        join("alice", 0);
        join("bob", 1);

        assertThatThrownBy(() -> gameService.startGame(game.getGameId(), null))
                .isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> gameService.startGame(game.getGameId(), "not-a-uuid"))
                .isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> gameService.startGame(game.getGameId(), UUID.randomUUID().toString()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void startGameRejectsFewerThanTheMinimumPlayers() {
        String hostToken = join("alice", 0).playerToken();

        assertThatThrownBy(() -> gameService.startGame(game.getGameId(), hostToken))
                .isInstanceOf(InvalidGameStateException.class)
                .hasMessageContaining("At least 2 players");
        assertThat(game.getGameStatus()).isEqualTo(GameStatus.NEW);
    }

    @Test
    void startGameRejectsUnknownGame() {
        assertThatThrownBy(() -> gameService.startGame("no-such-game", UUID.randomUUID().toString()))
                .isInstanceOf(GameNotFoundException.class);
    }

    @Test
    void takeTurnRejectsAMatchThatIsNotInProgress() {
        String hostToken = join("alice", 0).playerToken();

        assertThatThrownBy(() -> gameService.takeTurn(game.getGameId(), fireCommand(-45, 50), hostToken))
                .isInstanceOf(InvalidGameStateException.class);
    }

    @Test
    void takeTurnRejectsOutOfTurnPlayerWithConflict() {
        List<String> tokens = startTwoPlayerMatch();

        assertThatThrownBy(() -> gameService.takeTurn(game.getGameId(), fireCommand(-45, 50), tokens.get(1)))
                .isInstanceOf(InvalidGameStateException.class)
                .hasMessageContaining("not your turn");
        assertThat(game.getTurnNumber()).isZero();
    }

    @Test
    void takeTurnRejectsWrongOrMissingTokenWithForbidden() {
        startTwoPlayerMatch();

        assertThatThrownBy(() -> gameService.takeTurn(game.getGameId(), fireCommand(-45, 50),
                UUID.randomUUID().toString())).isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> gameService.takeTurn(game.getGameId(), fireCommand(-45, 50), null))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void validFireTurnResolvesAndPassesTheTurnOn() {
        List<String> tokens = startTwoPlayerMatch();

        MatchEvent event = gameService.takeTurn(game.getGameId(), fireCommand(-60, 70), tokens.get(0));

        assertThat(event.type()).isEqualTo(MatchEvent.MatchEventType.TURN_RESOLVED);
        assertThat(event.game()).isNotSameAs(game).isEqualTo(game.snapshot());
        assertThat(event.turnResult().actingPlayerIndex()).isZero();
        assertThat(event.turnResult().projectilePath()).isNotEmpty();
        assertThat(game.getCurrentPlayerIndex()).isEqualTo(1);
        assertThat(game.getTurnNumber()).isEqualTo(1);
        assertThat(game.getPlayers().get(0).getTank().getTurretAngle()).isEqualTo(-60);
        assertThat(game.getPlayers().get(0).getTank().getShotPower()).isEqualTo(70);

        gameService.takeTurn(game.getGameId(), fireCommand(-120, 70), tokens.get(1));
        assertThat(game.getCurrentPlayerIndex()).isZero();
        assertThat(game.getTurnNumber()).isEqualTo(2);
    }

    @Test
    void driveTurnMovesTheTank() {
        List<String> tokens = startTwoPlayerMatch();
        float startX = game.getPlayers().get(0).getTank().getPosition().getX();
        TurnCommand driveCommand = new TurnCommand();
        driveCommand.setActionName(TankActionName.DRIVE);
        driveCommand.setDriveDistance(40);

        MatchEvent event = gameService.takeTurn(game.getGameId(), driveCommand, tokens.get(0));

        assertThat(event.turnResult().drivePath()).isNotEmpty();
        assertThat(game.getPlayers().get(0).getTank().getPosition().getX()).isGreaterThan(startX);
        assertThat(game.getCurrentPlayerIndex()).isEqualTo(1);
    }

    @ParameterizedTest
    @CsvSource({ "1, 50", "-181, 50", "-45, -1", "-45, 101" })
    void takeTurnRejectsFireValuesOutOfBounds(int turretAngle, int shotPower) {
        List<String> tokens = startTwoPlayerMatch();

        assertThatThrownBy(
                () -> gameService.takeTurn(game.getGameId(), fireCommand(turretAngle, shotPower), tokens.get(0)))
                .isInstanceOf(InvalidRequestException.class);
        assertThat(game.getCurrentPlayerIndex()).isZero();
        assertThat(game.getTurnNumber()).isZero();
    }

    @ParameterizedTest
    @ValueSource(ints = { -151, 151 })
    void takeTurnRejectsDriveDistanceOutOfBounds(int driveDistance) {
        List<String> tokens = startTwoPlayerMatch();
        TurnCommand driveCommand = new TurnCommand();
        driveCommand.setActionName(TankActionName.DRIVE);
        driveCommand.setDriveDistance(driveDistance);

        assertThatThrownBy(() -> gameService.takeTurn(game.getGameId(), driveCommand, tokens.get(0)))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void takeTurnRejectsMissingActionAndMissingFields() {
        List<String> tokens = startTwoPlayerMatch();

        assertThatThrownBy(() -> gameService.takeTurn(game.getGameId(), new TurnCommand(), tokens.get(0)))
                .isInstanceOf(InvalidRequestException.class);
        TurnCommand fireWithoutPower = new TurnCommand();
        fireWithoutPower.setActionName(TankActionName.STANDARD_SHOT);
        fireWithoutPower.setTurretAngle(-45);
        assertThatThrownBy(() -> gameService.takeTurn(game.getGameId(), fireWithoutPower, tokens.get(0)))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void takeTurnRejectsAWeaponWithNoRoundsLeft() {
        List<String> tokens = startTwoPlayerMatch();
        game.getPlayers().get(0).getTank().getRemainingRounds().put(TankActionName.BEGEMOT, 0);
        TurnCommand begemotCommand = fireCommand(-45, 50);
        begemotCommand.setActionName(TankActionName.BEGEMOT);

        assertThatThrownBy(() -> gameService.takeTurn(game.getGameId(), begemotCommand, tokens.get(0)))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("No rounds left");
    }

    @Test
    void aWinningShotFinishesTheMatchAndRecordsTheWinner() {
        List<String> tokens = startTwoPlayerMatch();
        FlatGroundDuel.arrange(game);
        FlatGroundDuel.Shot shot = FlatGroundDuel.findWinningShot();
        TurnCommand winningShot = fireCommand(shot.turretAngle(), shot.shotPower());

        MatchEvent event = gameService.takeTurn(game.getGameId(), winningShot, tokens.get(0));

        assertThat(game.getGameStatus()).isEqualTo(GameStatus.FINISHED);
        assertThat(game.getWinnerIndex()).isZero();
        assertThat(event.turnResult().winnerIndex()).isZero();
        assertThatThrownBy(() -> gameService.takeTurn(game.getGameId(), fireCommand(-45, 50), tokens.get(1)))
                .isInstanceOf(InvalidGameStateException.class);
    }

    @Test
    void aShotThatDestroysEveryTankFinishesTheMatchWithNoSurvivor() {
        List<String> tokens = startTwoPlayerMatch();
        FlatGroundDuel.arrange(game);
        // A straight-up shot lands on the shooter's own tank, so the shooter is destroyed too.
        game.getPlayers().get(0).getTank().setShields(1);
        game.getPlayers().get(1).getTank().setShields(0);

        gameService.takeTurn(game.getGameId(), fireCommand(-90, 0), tokens.get(0));

        assertThat(game.getGameStatus()).isEqualTo(GameStatus.FINISHED);
        assertThat(game.getWinnerIndex()).isEqualTo(EngineConstants.NO_SURVIVOR_INDEX);
    }

    @Test
    void parallelJoinsForTheSameColorLetExactlyOnePlayerIn() throws Exception {
        int attemptCount = 12;
        List<Boolean> outcomes = runInParallel(attemptCount,
                attemptIndex -> tryToJoin("player" + attemptIndex, 3));

        assertThat(outcomes.stream().filter(joined -> joined).count()).isEqualTo(1);
        assertThat(game.getPlayers()).hasSize(1);
        assertThat(game.getClaimedColors()[3]).isEqualTo(game.getPlayers().get(0).getName());
    }

    @Test
    void parallelJoinsNeverExceedMaxPlayersOrShareAColorOrIndex() throws Exception {
        int attemptCount = 24;
        List<Boolean> outcomes = runInParallel(attemptCount,
                attemptIndex -> tryToJoin("player" + attemptIndex, attemptIndex % GameConstants.MAX_PLAYERS));

        assertThat(outcomes.stream().filter(joined -> joined).count()).isEqualTo(GameConstants.MAX_PLAYERS);
        assertThat(game.getPlayers()).hasSize(GameConstants.MAX_PLAYERS);
        assertThat(game.getPlayers().stream().map(player -> player.getTank().getColorIndex()).distinct())
                .hasSize(GameConstants.MAX_PLAYERS);
        assertThat(game.getPlayers().stream().map(Player::getPlayerIndex).toList())
                .containsExactly(0, 1, 2, 3, 4, 5);
    }

    private boolean tryToJoin(String playerName, int color) {
        try {
            join(playerName, color);
            return true;
        } catch (InvalidRequestException | InvalidGameStateException rejection) {
            return false;
        }
    }

    private List<Boolean> runInParallel(int taskCount, IntFunction<Boolean> task) throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(taskCount);
        CountDownLatch startSignal = new CountDownLatch(1);
        try {
            List<Future<Boolean>> futures = new ArrayList<>();
            for (int taskIndex = 0; taskIndex < taskCount; taskIndex++) {
                int capturedIndex = taskIndex;
                futures.add(executor.submit(() -> {
                    startSignal.await();
                    return task.apply(capturedIndex);
                }));
            }
            startSignal.countDown();
            List<Boolean> outcomes = new ArrayList<>();
            for (Future<Boolean> future : futures) {
                outcomes.add(future.get(10, TimeUnit.SECONDS));
            }
            return outcomes;
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void everyStateChangeRefreshesLastActivity() {
        clock.advance(Duration.ofMinutes(5));
        String hostToken = join("alice", 0).playerToken();
        assertThat(game.getLastActivityAt()).isEqualTo(clock.instant());

        clock.advance(Duration.ofMinutes(5));
        join("bob", 1);
        assertThat(game.getLastActivityAt()).isEqualTo(clock.instant());

        clock.advance(Duration.ofMinutes(5));
        gameService.startGame(game.getGameId(), hostToken);
        assertThat(game.getLastActivityAt()).isEqualTo(clock.instant());

        clock.advance(Duration.ofMinutes(5));
        gameService.takeTurn(game.getGameId(), fireCommand(-60, 70), hostToken);
        assertThat(game.getLastActivityAt()).isEqualTo(clock.instant());
    }

    @Test
    void idleCleanupRemovesOnlyMatchesIdleLongerThanTheTimeout() {
        IdleMatchCleaner cleaner = new IdleMatchCleaner(gameStorage, clock, Duration.ofHours(1));
        Game idleGame = game;
        clock.advance(Duration.ofMinutes(45));
        Game recentGame = gameService.initializeGame();
        clock.advance(Duration.ofMinutes(30));

        int removedCount = cleaner.removeIdleMatches();

        assertThat(removedCount).isEqualTo(1);
        assertThat(gameStorage.findById(idleGame.getGameId())).isEmpty();
        assertThat(gameStorage.findById(recentGame.getGameId())).isPresent();
    }

    @Test
    void activityKeepsAMatchFromBeingCleanedUp() {
        IdleMatchCleaner cleaner = new IdleMatchCleaner(gameStorage, clock, Duration.ofHours(1));
        clock.advance(Duration.ofMinutes(50));
        join("alice", 0);
        clock.advance(Duration.ofMinutes(50));

        assertThat(cleaner.removeIdleMatches()).isZero();
        assertThat(gameStorage.findById(game.getGameId())).isPresent();
    }

    @Test
    void getGameRejectsUnknownGame() {
        assertThatThrownBy(() -> gameService.getGame("no-such-game"))
                .isInstanceOf(GameNotFoundException.class);
    }

    @ParameterizedTest
    @ValueSource(ints = { -1, 6, 100 })
    void joinGameRejectsColorOutOfRange(int requestedColor) {
        assertThatThrownBy(() -> gameService.joinGame("alice", requestedColor, game.getGameId()))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("between 0 and 5");
        assertThat(game.getPlayers()).isEmpty();
    }

    @Test
    void joinGameRejectsMissingColor() {
        assertThatThrownBy(() -> gameService.joinGame("alice", null, game.getGameId()))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void joinGameRejectsColorAlreadyClaimed() throws Exception {
        gameService.joinGame("alice", 2, game.getGameId());

        assertThatThrownBy(() -> gameService.joinGame("bob", 2, game.getGameId()))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("already been claimed");
        assertThat(game.getPlayers()).hasSize(1);
    }

    @Test
    void joinGameRejectsBlankOrTooLongNames() {
        assertThatThrownBy(() -> gameService.joinGame("  ", 0, game.getGameId()))
                .isInstanceOf(InvalidRequestException.class);
        assertThatThrownBy(() -> gameService.joinGame(null, 0, game.getGameId()))
                .isInstanceOf(InvalidRequestException.class);
        String tooLongName = "x".repeat(GameConstants.MAX_PLAYER_NAME_LENGTH + 1);
        assertThatThrownBy(() -> gameService.joinGame(tooLongName, 0, game.getGameId()))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("at most");
    }

    @Test
    void joinGameAcceptsTwentyLetterNameWithSurroundingSpacesAndStoresItTrimmed() throws Exception {
        String twentyLetterName = "x".repeat(GameConstants.MAX_PLAYER_NAME_LENGTH);

        Game joined = gameService.joinGame("  " + twentyLetterName + "  ", 0, game.getGameId()).game();

        assertThat(joined.getPlayers().get(0).getName()).isEqualTo(twentyLetterName);
        assertThat(joined.getClaimedColors()[0]).isEqualTo(twentyLetterName);
    }

    @Test
    void joinGameRejectsWhitespaceOnlyName() {
        assertThatThrownBy(() -> gameService.joinGame("   ", 0, game.getGameId()))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("required");
        assertThat(game.getPlayers()).isEmpty();
    }

    @Test
    void takeTurnChecksTheTokenBeforeTheMatchStatus() {
        join("alice", 0);

        assertThatThrownBy(() -> gameService.takeTurn(game.getGameId(), fireCommand(-45, 50),
                UUID.randomUUID().toString()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void snapshotIsUnaffectedByLaterChangesToTheLiveMatch() {
        startTwoPlayerMatch();
        Game snapshot = gameService.getGame(game.getGameId());
        Game expected = game.snapshot();

        game.getPlayers().get(0).getTank().setShields(0);
        game.getPlayers().get(0).getTank().getPosition().setX(-1f);
        game.getPlayers().get(0).getTank().getRemainingRounds().put(TankActionName.BEGEMOT, 0);
        game.getPlayers().get(0).getTank().getTankActions().getStandardShot().setDamage(999);
        game.getPlayers().get(0).getTank().getTankActions().getStandardShot().getExplosionColor()[0] = 1;
        game.getPlayers().get(1).setName("renamed");
        game.getTopography().get(0).setY(-5f);
        game.getClouds().get(0).point().setX(-7f);
        game.getClaimedColors()[0] = "changed";
        game.setTurnNumber(99);
        game.setGameStatus(GameStatus.FINISHED);

        assertThat(snapshot).isEqualTo(expected);
        assertThat(snapshot.getPlayers()).extracting(Player::getPlayerToken).containsOnlyNulls();
    }

    @Test
    void everyServiceMethodReturnsSnapshotsNotTheLiveMatch() {
        String hostToken = join("alice", 0).playerToken();
        String guestToken = join("bob", 1).playerToken();

        assertThat(gameService.initializeGame()).isNotSameAs(
                gameStorage.findById(gameService.initializeGame().getGameId()).orElseThrow());
        assertThat(gameService.getGame(game.getGameId())).isNotSameAs(game);
        assertThat(join("carol", 2).game()).isNotSameAs(game);
        assertThat(gameService.startGame(game.getGameId(), hostToken)).isNotSameAs(game);
        MatchEvent event = gameService.takeTurn(game.getGameId(), fireCommand(-60, 70), hostToken);
        assertThat(event.game()).isNotSameAs(game);
        assertThat(guestToken).isNotBlank();
    }

    @Test
    void eventsArePublishedForEachStateChangeInOrder() {
        List<String> tokens = startTwoPlayerMatch();
        gameService.takeTurn(game.getGameId(), fireCommand(-60, 70), tokens.get(0));

        assertThat(recordedEvents).extracting(MatchEvent::type).containsExactly(
                MatchEvent.MatchEventType.GAME_UPDATED, MatchEvent.MatchEventType.GAME_UPDATED,
                MatchEvent.MatchEventType.GAME_UPDATED, MatchEvent.MatchEventType.TURN_RESOLVED);
    }

    @Test
    void concurrentJoinsReadsAndTurnsLeaveAConsistentMatchAndOrderedEvents() throws Exception {
        String hostToken = join("host", 0).playerToken();
        String guestToken = join("guest", 1).playerToken();
        gameService.startGame(game.getGameId(), hostToken);
        // Turns need an active match, joins need a new one: run joins first on a second match with the same pattern.
        Game joinMatch = gameService.initializeGame();
        String joinMatchId = joinMatch.getGameId();
        int threadCount = 24;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startSignal = new CountDownLatch(1);
        List<Future<?>> futures = new ArrayList<>();
        List<String> joinedNames = java.util.Collections.synchronizedList(new ArrayList<>());
        for (int workerIndex = 0; workerIndex < threadCount; workerIndex++) {
            final int worker = workerIndex;
            futures.add(executor.submit(() -> {
                startSignal.await();
                for (int round = 0; round < 20; round++) {
                    try {
                        if (worker % 3 == 0) {
                            String name = "p" + worker + "-" + round;
                            gameService.joinGame(name, worker % GameConstants.MAX_PLAYERS, joinMatchId);
                            joinedNames.add(name);
                        }
                    } catch (InvalidGameStateException | InvalidRequestException expectedRejection) {
                        // match full or color taken: fine
                    }
                    gameService.getGame(joinMatchId);
                    try {
                        gameService.takeTurn(game.getGameId(), fireCommand(-60, 70),
                                worker % 2 == 0 ? hostToken : guestToken);
                    } catch (InvalidGameStateException | InvalidRequestException expectedRejection) {
                        // not this player's turn or match finished: fine
                    }
                }
                return null;
            }));
        }
        startSignal.countDown();
        for (Future<?> future : futures) {
            future.get(30, TimeUnit.SECONDS);
        }
        executor.shutdownNow();

        Game finalJoinState = gameService.getGame(joinMatchId);
        assertThat(finalJoinState.getPlayers()).extracting(Player::getName)
                .containsExactlyInAnyOrderElementsOf(joinedNames);
        List<Integer> playerCountsInPublishOrder = recordedEvents.stream()
                .filter(event -> event.game().getGameId().equals(joinMatchId))
                .map(event -> event.game().getPlayers().size()).toList();
        assertThat(playerCountsInPublishOrder).isSorted();
        assertThat(playerCountsInPublishOrder).hasSize(joinedNames.size());
        List<Integer> turnNumbersInPublishOrder = recordedEvents.stream()
                .filter(event -> event.game().getGameId().equals(game.getGameId()))
                .filter(event -> event.type() == MatchEvent.MatchEventType.TURN_RESOLVED)
                .map(event -> event.game().getTurnNumber()).toList();
        assertThat(turnNumbersInPublishOrder).isSorted();
    }
}
