package com.plcoding.tanksmp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

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
    private GameService gameService;
    private Game game;

    @BeforeEach
    void setUp() {
        gameStorage = new GameStorage();
        gameService = new GameService(gameStorage);
        game = gameService.initializeGame();
    }

    @Test
    void initializeGameCreatesAndStoresANewGame() {
        assertThat(game.getGameId()).isNotBlank();
        assertThat(game.getId()).isEqualTo(game.getGameId());
        assertThat(game.getGameStatus()).isEqualTo(GameStatus.NEW);
        assertThat(game.getPlayers()).isEmpty();
        assertThat(game.getTopography()).isNotEmpty();
        assertThat(game.getColorSchema()).isIn(
                ColorSchemas.DAY_COLORS.toString(), ColorSchemas.DUSK_COLORS.toString());
        assertThat(gameStorage.findById(game.getGameId())).contains(game);
    }

    @Test
    void joinGameAddsPlayerWithFreshTankAndClaimsColor() throws Exception {
        Game joined = gameService.joinGame("alice", 2, game.getGameId());

        assertThat(joined.getPlayers()).hasSize(1);
        Player player = joined.getPlayers().get(0);
        assertThat(player.getName()).isEqualTo("alice");
        assertThat(player.getPlayerGameId()).isZero();
        assertThat(player.getTank().getShields()).isEqualTo(100);
        assertThat(player.getTank().getRequestedColor()).isEqualTo(2);
        assertThat(player.getTank().getSelectedAction()).isEqualTo(TankActionName.STANDARD_SHOT);
        assertThat(joined.getClaimedColors()[2]).isEqualTo("alice");

        gameService.joinGame("bob", 3, game.getGameId());
        assertThat(joined.getPlayers().get(1).getPlayerGameId()).isEqualTo(1);
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
            gameService.joinGame("player" + i, i, game.getGameId());
        }

        assertThatThrownBy(() -> gameService.joinGame("late", 0, game.getGameId()))
                .isInstanceOf(InvalidGameStateException.class);
    }

    @Test
    void joinGameRejectsPlayersAfterStart() throws Exception {
        gameService.joinGame("alice", 0, game.getGameId());
        gameService.startGame(game.getGameId());

        assertThatThrownBy(() -> gameService.joinGame("bob", 1, game.getGameId()))
                .isInstanceOf(InvalidGameStateException.class);
    }

    @Test
    void startGameMovesGameInProgressOnlyOnce() throws Exception {
        Game started = gameService.startGame(game.getGameId());
        assertThat(started.getGameStatus()).isEqualTo(GameStatus.IN_PROGRESS);

        assertThatThrownBy(() -> gameService.startGame(game.getGameId()))
                .isInstanceOf(InvalidGameStateException.class);
    }

    @Test
    void startGameRejectsUnknownGame() {
        assertThatThrownBy(() -> gameService.startGame("no-such-game"))
                .isInstanceOf(GameNotFoundException.class);
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

        Game joined = gameService.joinGame("  " + twentyLetterName + "  ", 0, game.getGameId());

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
}
