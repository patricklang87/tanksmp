package com.plcoding.tanksmp.service;

import com.plcoding.tanksmp.controllers.dto.MatchEvent;

/** Delivers match events to everyone watching the match. */
public interface MatchEventPublisher {

    void publish(MatchEvent matchEvent);
}
