package com.plcoding.tanksmp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.plcoding.tanksmp.exceptions.InvaildGameException;
import com.plcoding.tanksmp.exceptions.InvaildParamException;
import com.plcoding.tanksmp.model.Game;
import com.plcoding.tanksmp.model.GameStatus;
import com.plcoding.tanksmp.model.Player;
import com.plcoding.tanksmp.model.keywords.ColorSchemas;
import com.plcoding.tanksmp.model.keywords.TankActionName;
import com.plcoding.tanksmp.storage.GameStorage;

class GameServiceTest {

    private GameService gameService;
    private Game game;

    @BeforeEach
    void setUp() {
        gameService = new GameService();
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
        assertThat(GameStorage.getInstance().getGames()).containsEntry(game.getGameId(), game);
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
                .isInstanceOf(InvaildParamException.class);
    }

    @Test
    void joinGameRejectsDuplicateName() throws Exception {
        gameService.joinGame("alice", 0, game.getGameId());

        assertThatThrownBy(() -> gameService.joinGame("alice", 1, game.getGameId()))
                .isInstanceOf(InvaildParamException.class)
                .hasMessageContaining("already taken");
    }

    @Test
    void joinGameRejectsPlayersOnceFull() throws Exception {
        for (int i = 0; i < game.getMaxPlayerCount(); i++) {
            gameService.joinGame("player" + i, i, game.getGameId());
        }

        assertThatThrownBy(() -> gameService.joinGame("late", 0, game.getGameId()))
                .isInstanceOf(InvaildGameException.class);
    }

    @Test
    void joinGameRejectsPlayersAfterStart() throws Exception {
        gameService.joinGame("alice", 0, game.getGameId());
        gameService.startGame(game.getGameId());

        assertThatThrownBy(() -> gameService.joinGame("bob", 1, game.getGameId()))
                .isInstanceOf(InvaildGameException.class);
    }

    @Test
    void startGameMovesGameInProgressOnlyOnce() throws Exception {
        Game started = gameService.startGame(game.getGameId());
        assertThat(started.getGameStatus()).isEqualTo(GameStatus.IN_PROGRESS);

        assertThatThrownBy(() -> gameService.startGame(game.getGameId()))
                .isInstanceOf(InvaildGameException.class);
    }

    @Test
    void startGameRejectsUnknownGame() {
        assertThatThrownBy(() -> gameService.startGame("no-such-game"))
                .isInstanceOf(InvaildParamException.class);
    }
}
