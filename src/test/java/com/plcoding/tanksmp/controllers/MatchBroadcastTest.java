package com.plcoding.tanksmp.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.plcoding.tanksmp.controllers.dto.MatchEvent;
import com.plcoding.tanksmp.controllers.dto.MatchEvent.MatchEventType;

@SpringBootTest
@AutoConfigureMockMvc
class MatchBroadcastTest {

    private static final String TOKEN_HEADER = "X-Player-Token";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SimpMessagingTemplate simpMessagingTemplate;

    private String joinAndGetToken(String gameId, String name, int color) throws Exception {
        String body = mockMvc.perform(post("/api/matches/" + gameId + "/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"playerName\": \"" + name + "\", \"requestedColor\": " + color + "}"))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.playerToken");
    }

    @Test
    void everyStateChangeIsBroadcastToTheMatchTopicWithoutLeakingTokens() throws Exception {
        String createBody = mockMvc.perform(post("/api/matches")).andReturn().getResponse().getContentAsString();
        String gameId = JsonPath.read(createBody, "$.gameId");
        String topic = "/topic/game-progress/" + gameId;
        String aliceToken = joinAndGetToken(gameId, "alice", 0);
        String bobToken = joinAndGetToken(gameId, "bob", 1);
        mockMvc.perform(post("/api/matches/" + gameId + "/start").header(TOKEN_HEADER, aliceToken));
        mockMvc.perform(post("/api/matches/" + gameId + "/turns")
                .header(TOKEN_HEADER, aliceToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"actionName\": \"STANDARD_SHOT\", \"turretAngle\": -60, \"shotPower\": 70}"));

        ArgumentCaptor<Object> payloadCaptor = ArgumentCaptor.forClass(Object.class);
        verify(simpMessagingTemplate, atLeastOnce()).convertAndSend(eq(topic), payloadCaptor.capture());
        List<MatchEvent> events = payloadCaptor.getAllValues().stream().map(MatchEvent.class::cast).toList();

        assertThat(events.stream().map(MatchEvent::type).toList()).containsExactly(
                MatchEventType.GAME_UPDATED, MatchEventType.GAME_UPDATED, MatchEventType.GAME_UPDATED,
                MatchEventType.TURN_RESOLVED);
        MatchEvent turnEvent = events.get(3);
        assertThat(turnEvent.turnResult()).isNotNull();
        assertThat(turnEvent.turnResult().actingPlayerIndex()).isZero();
        assertThat(turnEvent.game().getCurrentPlayerIndex()).isEqualTo(1);
        assertThat(events.get(0).turnResult()).isNull();

        for (MatchEvent event : events) {
            String eventJson = objectMapper.writeValueAsString(event);
            assertThat(eventJson).doesNotContain(aliceToken).doesNotContain(bobToken).doesNotContain("playerToken");
        }
    }

    @Test
    void rejectedCommandsBroadcastNothing() throws Exception {
        String createBody = mockMvc.perform(post("/api/matches")).andReturn().getResponse().getContentAsString();
        String gameId = JsonPath.read(createBody, "$.gameId");

        mockMvc.perform(post("/api/matches/" + gameId + "/start"));

        verify(simpMessagingTemplate, never()).convertAndSend(
                any(String.class), any(Object.class));
    }
}
