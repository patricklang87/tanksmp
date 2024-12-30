package com.plcoding.tanksmp.service;

import java.util.ArrayList;
import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.exceptions.InvaildGameException;
import com.plcoding.tanksmp.exceptions.InvaildParamException;
import com.plcoding.tanksmp.model.Game;
import com.plcoding.tanksmp.model.GameStatus;
import com.plcoding.tanksmp.model.Player;
import com.plcoding.tanksmp.model.Tank;
import com.plcoding.tanksmp.model.Topography;
import com.plcoding.tanksmp.model.keywords.ColorSchemas;
import com.plcoding.tanksmp.storage.GameStorage;

@Service
@AllArgsConstructor
public class GameService {
    public Game initializeGame(String playerName, Float[] requestedColor) {
        Game game = new Game();
        game.setGameId(UUID.randomUUID().toString());
        ArrayList<Point2D> topography = new Topography().createInitialTopography(1400, 800);

        game.setTopography(topography);
        game.setGameStatus(GameStatus.NEW);
        Tank newTank = new Tank().initializeTank(requestedColor);
        Player firstPlayer = new Player(playerName, newTank, 0, 0);
        ArrayList<Player> players = new ArrayList<Player>();
        players.add(firstPlayer);
        game.setPlayers(players);

        String colorSchema;
        if (Math.random() > 0.5) {
            colorSchema = ColorSchemas.DAY_COLORS.toString();
        } else {
            colorSchema = ColorSchemas.DUSK_COLORS.toString();
        }
        game.setColorSchema(colorSchema);
        game.setCurrentPlayerIndex(0);

        GameStorage.getInstance().setGame(game);
        return game;
    }

    public Game joinGame(String playerName, Float[] requestedColor, String gameId)
            throws InvaildParamException, InvaildGameException {
        if (!GameStorage.getInstance().getGames().containsKey(gameId)) {
            throw new InvaildParamException("A game with that ID does not exist.");
        }
        Game requestedGame = GameStorage.getInstance().getGames().get(gameId);
        Integer currentPlayerCount = requestedGame.getPlayers().size();
        GameStatus gameStatus = requestedGame.getGameStatus();
        Boolean gameFull = currentPlayerCount >= requestedGame.getMaxPlayerCount();
        Boolean invalidGameStatus = !gameStatus.equals(GameStatus.NEW);
        if (gameFull || invalidGameStatus) {
            throw new InvaildGameException("Game is not current accepting players.");
        }
        Boolean invalidPlayerName = requestedGame.getPlayers().stream()
                .anyMatch(player -> player.getName().equals(playerName));
        if (invalidPlayerName) {
            throw new InvaildParamException("The given name is already taken for this game ID.");
        }
        Tank newTank = new Tank().initializeTank(requestedColor);
        Player newPlayer = new Player(playerName, newTank, currentPlayerCount, 0);
        requestedGame.getPlayers().add(newPlayer);
        GameStorage.getInstance().setGame(requestedGame);

        return requestedGame;
    }

    public Game startGame(Integer playerGameId, String gameId) throws InvaildParamException, InvaildGameException {
        Game requestedGame = GameStorage.getInstance().getGames().get(gameId);
        if (!GameStorage.getInstance().getGames().containsKey(gameId)) {
            throw new InvaildParamException("A game with that ID does not exist.");
        }
        if (!requestedGame.getGameStatus().equals(GameStatus.NEW)) {
            throw new InvaildGameException("This game is already underway");
        }
        requestedGame.setGameStatus(GameStatus.IN_PROGRESS);

        return requestedGame;

    }
}
