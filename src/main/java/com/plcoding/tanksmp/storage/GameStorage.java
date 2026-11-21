package com.plcoding.tanksmp.storage;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

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
}
