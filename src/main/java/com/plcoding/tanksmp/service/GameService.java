package com.plcoding.tanksmp.service;

import java.util.ArrayList;
import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.exceptions.GameNotFoundException;
import com.plcoding.tanksmp.exceptions.InvalidGameStateException;
import com.plcoding.tanksmp.exceptions.InvalidRequestException;
import com.plcoding.tanksmp.model.Game;
import com.plcoding.tanksmp.model.GameStatus;
import com.plcoding.tanksmp.model.Player;
import com.plcoding.tanksmp.model.Tank;
import com.plcoding.tanksmp.model.Topography;
import com.plcoding.tanksmp.model.constants.GameConstants;
import com.plcoding.tanksmp.model.keywords.ColorSchemas;
import com.plcoding.tanksmp.storage.GameStorage;

@Service
@AllArgsConstructor
public class GameService {

    private final GameStorage gameStorage;

    public Game initializeGame() {
        Game game = new Game();
        game.setGameId(UUID.randomUUID().toString());
        game.setId(game.getGameId());
        ArrayList<Point2D> topography = new Topography().createInitialTopography();

        game.setTopography(topography);
        game.setGameStatus(GameStatus.NEW);
        game.setPlayers(new ArrayList<Player>());

        String colorSchema;
        if (Math.random() > 0.5) {
            colorSchema = ColorSchemas.DAY_COLORS.toString();
        } else {
            colorSchema = ColorSchemas.DUSK_COLORS.toString();
        }
        game.setColorSchema(colorSchema);
        game.setCurrentPlayerIndex(0);

        gameStorage.save(game);
        return game;
    }

    public Game getGame(String gameId) {
        return gameStorage.findById(gameId)
                .orElseThrow(() -> new GameNotFoundException("A game with that ID does not exist."));
    }

    public Game joinGame(String rawPlayerName, Integer requestedColor, String gameId) {
        Game requestedGame = getGame(gameId);
        String playerName = rawPlayerName == null ? null : rawPlayerName.trim();
        validatePlayerName(playerName);
        validateRequestedColor(requestedColor);

        Integer currentPlayerCount = requestedGame.getPlayers().size();
        Boolean gameFull = currentPlayerCount >= requestedGame.getMaxPlayerCount();
        Boolean invalidGameStatus = !requestedGame.getGameStatus().equals(GameStatus.NEW);
        if (gameFull || invalidGameStatus) {
            throw new InvalidGameStateException("Game is not currently accepting players.");
        }
        Boolean playerNameTaken = requestedGame.getPlayers().stream()
                .anyMatch(player -> player.getName().equals(playerName));
        if (playerNameTaken) {
            throw new InvalidRequestException("The given name is already taken for this game ID.");
        }
        Boolean colorClaimed = !requestedGame.getClaimedColors()[requestedColor].isEmpty();
        if (colorClaimed) {
            throw new InvalidRequestException("That tank color has already been claimed.");
        }

        Tank newTank = new Tank().initializeTank(requestedColor);
        requestedGame.getClaimedColors()[requestedColor] = playerName;
        Player newPlayer = new Player(playerName, newTank, currentPlayerCount, 0);
        requestedGame.getPlayers().add(newPlayer);
        gameStorage.save(requestedGame);

        return requestedGame;
    }

    public Game startGame(String gameId) {
        Game requestedGame = getGame(gameId);
        if (!requestedGame.getGameStatus().equals(GameStatus.NEW)) {
            throw new InvalidGameStateException("This game is already underway.");
        }
        requestedGame.setGameStatus(GameStatus.IN_PROGRESS);

        return requestedGame;
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
