package com.plcoding.tanksmp.storage;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Component;

import com.plcoding.tanksmp.model.Game;

/** In-memory store of matches, safe for concurrent access. */
@Component
public class GameStorage {
    private final Map<String, Game> gamesById = new ConcurrentHashMap<>();

    public Optional<Game> findById(String gameId) {
        if (gameId == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(gamesById.get(gameId));
    }

    public void save(Game game) {
        gamesById.put(game.getGameId(), game);
    }

    /** Removes every match last active before the cutoff and returns how many were removed. */
    public int removeIdleSince(Instant cutoff) {
        AtomicInteger removedCount = new AtomicInteger();
        gamesById.values().removeIf(game -> {
            boolean idle = game.getLastActivityAt().isBefore(cutoff);
            if (idle) {
                removedCount.incrementAndGet();
            }
            return idle;
        });
        return removedCount.get();
    }
}
