package com.plcoding.tanksmp.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.plcoding.tanksmp.storage.GameStorage;

import lombok.extern.slf4j.Slf4j;

/** Periodically removes matches nobody has touched for longer than the idle timeout. */
@Component
@Slf4j
public class IdleMatchCleaner {

    private final GameStorage gameStorage;
    private final Clock clock;
    private final Duration idleTimeout;

    public IdleMatchCleaner(GameStorage gameStorage, Clock clock,
            @Value("${app.match-idle-timeout}") Duration idleTimeout) {
        this.gameStorage = gameStorage;
        this.clock = clock;
        this.idleTimeout = idleTimeout;
    }

    @Scheduled(fixedDelayString = "${app.match-cleanup-interval}")
    public int removeIdleMatches() {
        Instant cutoff = clock.instant().minus(idleTimeout);
        int removedCount = gameStorage.removeIdleSince(cutoff);
        if (removedCount > 0) {
            log.info("removed {} idle match(es)", removedCount);
        }
        return removedCount;
    }
}
