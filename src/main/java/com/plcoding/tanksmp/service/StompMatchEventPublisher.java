package com.plcoding.tanksmp.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.plcoding.tanksmp.controllers.dto.MatchEvent;

import lombok.RequiredArgsConstructor;

/** Publishes match events to the match's websocket topic. */
@Component
@RequiredArgsConstructor
public class StompMatchEventPublisher implements MatchEventPublisher {

    private static final String GAME_PROGRESS_TOPIC = "/topic/game-progress/";

    private final SimpMessagingTemplate simpMessagingTemplate;

    @Override
    public void publish(MatchEvent matchEvent) {
        simpMessagingTemplate.convertAndSend(GAME_PROGRESS_TOPIC + matchEvent.gameId(), matchEvent);
    }
}
