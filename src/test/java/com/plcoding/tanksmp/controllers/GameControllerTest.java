package com.plcoding.tanksmp.controllers;

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

@SpringBootTest
@AutoConfigureMockMvc
class GameControllerTest {

    @Autowired
    private MockMvc mockMvc;

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

    private void joinGame(String gameId, String name, int color) throws Exception {
        mockMvc.perform(post("/api/matches/" + gameId + "/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(joinBody(name, color)))
                .andExpect(status().isOk());
    }

    @Test
    void playersCanCreateJoinAndStartAMatch() throws Exception {
        String gameId = createGame();

        mockMvc.perform(post("/api/matches/" + gameId + "/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(joinBody("alice", 0)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.players[0].name").value("alice"))
                .andExpect(jsonPath("$.claimedColors[0]").value("alice"));

        mockMvc.perform(post("/api/matches/" + gameId + "/start"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameStatus").value("IN_PROGRESS"));
    }

    @Test
    void fetchingAMatchReturnsItWithoutChangingIt() throws Exception {
        String gameId = createGame();
        joinGame(gameId, "alice", 0);

        mockMvc.perform(get("/api/matches/" + gameId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameId").value(gameId))
                .andExpect(jsonPath("$.gameStatus").value("NEW"))
                .andExpect(jsonPath("$.players.length()").value(1));
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
        mockMvc.perform(post("/api/matches/no-such-game/start"))
                .andExpect(status().isNotFound());
    }

    @Test
    void startingAMatchTwiceReturns409WithJsonMessage() throws Exception {
        String gameId = createGame();

        mockMvc.perform(post("/api/matches/" + gameId + "/start")).andExpect(status().isOk());
        mockMvc.perform(post("/api/matches/" + gameId + "/start"))
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
        mockMvc.perform(post("/api/matches/" + gameId + "/start")).andExpect(status().isOk());

        mockMvc.perform(post("/api/matches/" + gameId + "/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(joinBody("alice", 0)))
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
}
