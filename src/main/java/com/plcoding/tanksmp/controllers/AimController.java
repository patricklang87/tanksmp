package com.plcoding.tanksmp.controllers;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import com.plcoding.tanksmp.controllers.dto.AimUpdateCommand;
import com.plcoding.tanksmp.service.GameService;

import lombok.RequiredArgsConstructor;

/** Receives live aim updates sent to /app/matches/{gameId}/aim. Invalid updates are dropped silently. */
@Controller
@RequiredArgsConstructor
public class AimController {

    private final GameService gameService;

    @MessageMapping("/matches/{gameId}/aim")
    public void updateAim(@DestinationVariable("gameId") String gameId, @Payload AimUpdateCommand command) {
        gameService.updateAim(gameId, command);
    }
}
