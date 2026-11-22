package com.plcoding.tanksmp.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
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
import com.plcoding.tanksmp.controllers.dto.AimUpdateCommand;
import com.plcoding.tanksmp.controllers.dto.MatchEvent;
import com.plcoding.tanksmp.controllers.dto.MatchEvent.MatchEventType;
import com.plcoding.tanksmp.model.keywords.TankActionName;

@SpringBootTest
@AutoConfigureMockMvc
class AimControllerTest {

    private static final String TOKEN_HEADER = "X-Player-Token";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AimController aimController;

    @MockBean
    private SimpMessagingTemplate simpMessagingTemplate;

    private String joinAndGetToken(String gameId, String name, int color) throws Exception {
        String body = mockMvc.perform(post("/api/matches/" + gameId + "/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"playerName\": \"" + name + "\", \"requestedColor\": " + color + "}"))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.playerToken");
    }

    private AimUpdateCommand aim(String playerToken, int turretAngle, int shotPower) {
        AimUpdateCommand command = new AimUpdateCommand();
        command.setPlayerToken(playerToken);
        command.setTurretAngle(turretAngle);
        command.setShotPower(shotPower);
        command.setSelectedActionName(TankActionName.STANDARD_SHOT);
        return command;
    }

    @Test
    void validAimIsBroadcastOnceAndInvalidAimIsDroppedWithoutLeakingTheToken() throws Exception {
        String createBody = mockMvc.perform(post("/api/matches")).andReturn().getResponse().getContentAsString();
        String gameId = JsonPath.read(createBody, "$.gameId");
        String topic = "/topic/game-progress/" + gameId;
        String aliceToken = joinAndGetToken(gameId, "alice", 0);
        String bobToken = joinAndGetToken(gameId, "bob", 1);
        mockMvc.perform(post("/api/matches/" + gameId + "/start").header(TOKEN_HEADER, aliceToken));

        aimController.updateAim(gameId, aim(aliceToken, -135, 60)); // valid
        aimController.updateAim(gameId, aim(bobToken, -100, 40)); // not bob's turn
        aimController.updateAim(gameId, aim("not-a-token", -100, 40)); // bad token
        aimController.updateAim(gameId, aim(aliceToken, -250, 40)); // out of range
        aimController.updateAim("no-such-match", aim(aliceToken, -100, 40)); // unknown match

        ArgumentCaptor<Object> payloadCaptor = ArgumentCaptor.forClass(Object.class);
        verify(simpMessagingTemplate, times(4)).convertAndSend(eq(topic), payloadCaptor.capture());
        List<MatchEvent> aimEvents = payloadCaptor.getAllValues().stream().map(MatchEvent.class::cast)
                .filter(event -> event.type() == MatchEventType.AIM_UPDATED).toList();
        assertThat(aimEvents).hasSize(1);
        assertThat(aimEvents.get(0).aim())
                .isEqualTo(new MatchEvent.AimUpdate(0, -135, 60, TankActionName.STANDARD_SHOT));
        verify(simpMessagingTemplate, never()).convertAndSend(eq("/topic/game-progress/no-such-match"),
                any(Object.class));

        String aimJson = objectMapper.writeValueAsString(aimEvents.get(0));
        assertThat(aimJson).doesNotContain(aliceToken).doesNotContain(bobToken).doesNotContain("playerToken");
        assertThat(aimJson).contains("AIM_UPDATED").contains("\"turretAngle\":-135");
    }
}
