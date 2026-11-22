package com.plcoding.tanksmp.controllers.dto;

import com.plcoding.tanksmp.engine.TurnResult;
import com.plcoding.tanksmp.model.Game;

/**
 * Message broadcast to everyone watching a match.
 *
 * @param type what happened
 * @param game the match after the change
 * @param turnResult how the turn played out; only set for {@link MatchEventType#TURN_RESOLVED}
 */
public record MatchEvent(MatchEventType type, Game game, TurnResult turnResult) {

    public enum MatchEventType {
        GAME_UPDATED, TURN_RESOLVED
    }

    public static MatchEvent gameUpdated(Game game) {
        return new MatchEvent(MatchEventType.GAME_UPDATED, game, null);
    }

    public static MatchEvent turnResolved(Game game, TurnResult turnResult) {
        return new MatchEvent(MatchEventType.TURN_RESOLVED, game, turnResult);
    }
}
