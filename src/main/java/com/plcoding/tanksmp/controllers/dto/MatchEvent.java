package com.plcoding.tanksmp.controllers.dto;

import com.plcoding.tanksmp.engine.TurnResult;
import com.plcoding.tanksmp.model.Game;
import com.plcoding.tanksmp.model.keywords.TankActionName;

/**
 * Message broadcast to everyone watching a match.
 *
 * @param type what happened
 * @param gameId the match the event belongs to; it selects the topic the event is published on
 * @param game the match after the change; null for {@link MatchEventType#AIM_UPDATED}
 * @param turnResult how the turn played out; only set for {@link MatchEventType#TURN_RESOLVED}
 * @param aim the current player's live aim; only set for {@link MatchEventType#AIM_UPDATED}
 */
public record MatchEvent(MatchEventType type, String gameId, Game game, TurnResult turnResult, AimUpdate aim) {

    public enum MatchEventType {
        GAME_UPDATED, TURN_RESOLVED, AIM_UPDATED
    }

    /** What the current player is aiming at right now. Display only; it never decides a turn. */
    public record AimUpdate(int playerIndex, int turretAngle, int shotPower, TankActionName selectedActionName) {
    }

    public static MatchEvent gameUpdated(Game game) {
        return new MatchEvent(MatchEventType.GAME_UPDATED, game.getGameId(), game, null, null);
    }

    public static MatchEvent turnResolved(Game game, TurnResult turnResult) {
        return new MatchEvent(MatchEventType.TURN_RESOLVED, game.getGameId(), game, turnResult, null);
    }

    public static MatchEvent aimUpdated(String gameId, AimUpdate aim) {
        return new MatchEvent(MatchEventType.AIM_UPDATED, gameId, null, null, aim);
    }
}
