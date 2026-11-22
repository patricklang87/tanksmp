package com.plcoding.tanksmp.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.jayway.jsonpath.JsonPath;
import com.plcoding.tanksmp.service.FlatGroundDuel;
import com.plcoding.tanksmp.storage.GameStorage;

@SpringBootTest
@AutoConfigureMockMvc
class GameControllerTest {

    private static final String TOKEN_HEADER = "X-Player-Token";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private GameStorage gameStorage;

    private String createGame() throws Exception {
        String body = mockMvc.perform(post("/api/matches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameStatus").value("NEW"))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.gameId");
    }

    private String joinBody(String name, int color) {
        return """
                {"playerName": "%s", "requestedColor": %d}
                """.formatted(name, color);
    }

    /** Joins the match and returns the new player's token. */
    private String joinGame(String gameId, String name, int color) throws Exception {
        String body = mockMvc.perform(post("/api/matches/" + gameId + "/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(joinBody(name, color)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.playerToken");
    }

    private String turnBody(int turretAngle, int shotPower) {
        return """
                {"actionName": "STANDARD_SHOT", "turretAngle": %d, "shotPower": %d}
                """.formatted(turretAngle, shotPower);
    }

    private void startMatch(String gameId, String playerToken) throws Exception {
        mockMvc.perform(post("/api/matches/" + gameId + "/start").header(TOKEN_HEADER, playerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameStatus").value("IN_PROGRESS"));
    }

    @Test
    void joiningReturnsTheGameTheSeatAndTheSecretToken() throws Exception {
        String gameId = createGame();

        mockMvc.perform(post("/api/matches/" + gameId + "/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(joinBody("alice", 0)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.game.players[0].name").value("alice"))
                .andExpect(jsonPath("$.game.claimedColors[0]").value("alice"))
                .andExpect(jsonPath("$.game.hostPlayerIndex").value(0))
                .andExpect(jsonPath("$.playerIndex").value(0))
                .andExpect(jsonPath("$.playerToken").isNotEmpty());
    }

    @Test
    void aWholeMatchCanBePlayedAndTokensNeverAppearInMatchJson() throws Exception {
        String gameId = createGame();
        String aliceToken = joinGame(gameId, "alice", 0);
        String bobToken = joinGame(gameId, "bob", 1);
        startMatch(gameId, aliceToken);

        mockMvc.perform(post("/api/matches/" + gameId + "/turns")
                .header(TOKEN_HEADER, aliceToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(turnBody(-60, 70)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPlayerIndex").value(1))
                .andExpect(jsonPath("$.turnNumber").value(1));
        mockMvc.perform(post("/api/matches/" + gameId + "/turns")
                .header(TOKEN_HEADER, bobToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(turnBody(-120, 70)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPlayerIndex").value(0))
                .andExpect(jsonPath("$.turnNumber").value(2));

        // Set up a decisive shot for alice's next turn.
        FlatGroundDuel.arrange(gameStorage.findById(gameId).orElseThrow());
        FlatGroundDuel.Shot winningShot = FlatGroundDuel.findWinningShot();
        mockMvc.perform(post("/api/matches/" + gameId + "/turns")
                .header(TOKEN_HEADER, aliceToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(turnBody(winningShot.turretAngle(), winningShot.shotPower())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameStatus").value("FINISHED"))
                .andExpect(jsonPath("$.winnerIndex").value(0));

        for (String responseBody : new String[] {
                mockMvc.perform(get("/api/matches/" + gameId)).andReturn().getResponse().getContentAsString(),
                mockMvc.perform(post("/api/matches/" + gameId + "/turns")
                        .header(TOKEN_HEADER, bobToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(turnBody(-45, 50)))
                        .andReturn().getResponse().getContentAsString() }) {
            assertThat(responseBody).doesNotContain(aliceToken).doesNotContain(bobToken).doesNotContain("playerToken");
        }
    }

    @Test
    void turnsAreRejectedWithForbiddenForBadTokensAndConflictOutOfTurn() throws Exception {
        String gameId = createGame();
        String aliceToken = joinGame(gameId, "alice", 0);
        String bobToken = joinGame(gameId, "bob", 1);
        startMatch(gameId, aliceToken);

        mockMvc.perform(post("/api/matches/" + gameId + "/turns")
                .header(TOKEN_HEADER, bobToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(turnBody(-60, 70)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("It is not your turn."));
        mockMvc.perform(post("/api/matches/" + gameId + "/turns")
                .header(TOKEN_HEADER, "00000000-0000-0000-0000-000000000000")
                .contentType(MediaType.APPLICATION_JSON)
                .content(turnBody(-60, 70)))
                .andExpect(status().isForbidden())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").exists());
        mockMvc.perform(post("/api/matches/" + gameId + "/turns")
                .contentType(MediaType.APPLICATION_JSON)
                .content(turnBody(-60, 70)))
                .andExpect(status().isForbidden());
    }

    @Test
    void aTurnWithValuesOutOfBoundsReturns400() throws Exception {
        String gameId = createGame();
        String aliceToken = joinGame(gameId, "alice", 0);
        joinGame(gameId, "bob", 1);
        startMatch(gameId, aliceToken);

        mockMvc.perform(post("/api/matches/" + gameId + "/turns")
                .header(TOKEN_HEADER, aliceToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(turnBody(45, 70)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void startingRequiresTheHostsToken() throws Exception {
        String gameId = createGame();
        joinGame(gameId, "alice", 0);
        String bobToken = joinGame(gameId, "bob", 1);

        mockMvc.perform(post("/api/matches/" + gameId + "/start").header(TOKEN_HEADER, bobToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/matches/" + gameId + "/start"))
                .andExpect(status().isForbidden());
    }

    @Test
    void startingWithOnlyOnePlayerReturns409() throws Exception {
        String gameId = createGame();
        String aliceToken = joinGame(gameId, "alice", 0);

        mockMvc.perform(post("/api/matches/" + gameId + "/start").header(TOKEN_HEADER, aliceToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("At least 2 players are needed to start."));
    }

    @Test
    void fetchingAMatchReturnsItWithoutChangingIt() throws Exception {
        String gameId = createGame();
        String aliceToken = joinGame(gameId, "alice", 0);

        String body = mockMvc.perform(get("/api/matches/" + gameId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameId").value(gameId))
                .andExpect(jsonPath("$.gameStatus").value("NEW"))
                .andExpect(jsonPath("$.players.length()").value(1))
                .andExpect(jsonPath("$.id").doesNotExist())
                .andExpect(jsonPath("$.players[0].playerToken").doesNotExist())
                .andReturn().getResponse().getContentAsString();
        assertThat(body).doesNotContain(aliceToken);
    }

    @Test
    void fetchingAnUnknownMatchReturns404WithJsonMessage() throws Exception {
        mockMvc.perform(get("/api/matches/no-such-game"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("A game with that ID does not exist."))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void joiningAnUnknownMatchReturns404() throws Exception {
        mockMvc.perform(post("/api/matches/no-such-game/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(joinBody("alice", 0)))
                .andExpect(status().isNotFound());
    }

    @Test
    void startingAnUnknownMatchReturns404() throws Exception {
        mockMvc.perform(post("/api/matches/no-such-game/start").header(TOKEN_HEADER,
                "00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isNotFound());
    }

    @Test
    void turnOnAnUnknownMatchReturns404() throws Exception {
        mockMvc.perform(post("/api/matches/no-such-game/turns")
                .header(TOKEN_HEADER, "00000000-0000-0000-0000-000000000000")
                .contentType(MediaType.APPLICATION_JSON)
                .content(turnBody(-45, 50)))
                .andExpect(status().isNotFound());
    }

    @Test
    void startingAMatchTwiceReturns409WithJsonMessage() throws Exception {
        String gameId = createGame();
        String aliceToken = joinGame(gameId, "alice", 0);
        joinGame(gameId, "bob", 1);

        startMatch(gameId, aliceToken);
        mockMvc.perform(post("/api/matches/" + gameId + "/start").header(TOKEN_HEADER, aliceToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("This game is already underway."));
    }

    @Test
    void joiningWithAColorOutOfRangeReturns400WithJsonMessage() throws Exception {
        String gameId = createGame();

        mockMvc.perform(post("/api/matches/" + gameId + "/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(joinBody("alice", 6)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("The requested color must be between 0 and 5."))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void joiningWithAClaimedColorReturns400() throws Exception {
        String gameId = createGame();
        joinGame(gameId, "alice", 3);

        mockMvc.perform(post("/api/matches/" + gameId + "/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(joinBody("bob", 3)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("That tank color has already been claimed."));
    }

    @Test
    void joiningAMatchThatHasStartedReturns409() throws Exception {
        String gameId = createGame();
        String aliceToken = joinGame(gameId, "alice", 0);
        joinGame(gameId, "bob", 1);
        startMatch(gameId, aliceToken);

        mockMvc.perform(post("/api/matches/" + gameId + "/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(joinBody("carol", 2)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void joiningWithMalformedJsonReturns400WithFixedMessage() throws Exception {
        String gameId = createGame();

        mockMvc.perform(post("/api/matches/" + gameId + "/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{not valid json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("The request body is missing or malformed."));
    }

    @Test
    void theHostCanRematchAFinishedMatchAndOthersAndUnfinishedMatchesAreRejected() throws Exception {
        String gameId = createGame();
        String aliceToken = joinGame(gameId, "alice", 0);
        String bobToken = joinGame(gameId, "bob", 1);
        startMatch(gameId, aliceToken);

        mockMvc.perform(post("/api/matches/" + gameId + "/rematch").header(TOKEN_HEADER, aliceToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").isString());

        FlatGroundDuel.arrange(gameStorage.findById(gameId).orElseThrow());
        FlatGroundDuel.Shot winningShot = FlatGroundDuel.findWinningShot();
        mockMvc.perform(post("/api/matches/" + gameId + "/turns")
                .header(TOKEN_HEADER, aliceToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(turnBody(winningShot.turretAngle(), winningShot.shotPower())))
                .andExpect(jsonPath("$.gameStatus").value("FINISHED"));

        mockMvc.perform(post("/api/matches/" + gameId + "/rematch").header(TOKEN_HEADER, bobToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/matches/" + gameId + "/rematch"))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/matches/unknown/rematch").header(TOKEN_HEADER, aliceToken))
                .andExpect(status().isNotFound());

        String body = mockMvc.perform(post("/api/matches/" + gameId + "/rematch").header(TOKEN_HEADER, aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameStatus").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.turnNumber").value(0))
                .andExpect(jsonPath("$.winnerIndex").doesNotExist())
                .andExpect(jsonPath("$.currentPlayerIndex").value(1))
                .andExpect(jsonPath("$.players[0].wins").value(1))
                .andExpect(jsonPath("$.players[1].wins").value(0))
                .andExpect(jsonPath("$.players[1].tank.shields").value(100))
                .andReturn().getResponse().getContentAsString();
        assertThat(body).doesNotContain(aliceToken).doesNotContain(bobToken).doesNotContain("playerToken");
    }
}
