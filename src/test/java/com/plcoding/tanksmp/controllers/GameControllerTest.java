package com.plcoding.tanksmp.controllers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
        String body = mockMvc.perform(get("/match/initialize"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameStatus").value("NEW"))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.gameId");
    }

    private String joinBody(String gameId, String name, int color) {
        return """
                {"gameId": "%s", "playerName": "%s", "requestedColor": %d}
                """.formatted(gameId, name, color);
    }

    @Test
    void playersCanCreateJoinAndStartAMatch() throws Exception {
        String gameId = createGame();

        mockMvc.perform(post("/match/join").contentType(MediaType.APPLICATION_JSON)
                .content(joinBody(gameId, "alice", 0)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.players[0].name").value("alice"));

        mockMvc.perform(post("/match/start").contentType(MediaType.APPLICATION_JSON)
                .content("{\"gameId\": \"" + gameId + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameStatus").value("IN_PROGRESS"));
    }

    @Test
    void joiningAnUnknownMatchReturns404() throws Exception {
        mockMvc.perform(post("/match/join").contentType(MediaType.APPLICATION_JSON)
                .content(joinBody("no-such-game", "alice", 0)))
                .andExpect(status().isNotFound());
    }

    @Test
    void startingAMatchTwiceReturns400() throws Exception {
        String gameId = createGame();
        String body = "{\"gameId\": \"" + gameId + "\"}";

        mockMvc.perform(post("/match/start").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk());
        mockMvc.perform(post("/match/start").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }
}
