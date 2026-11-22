package com.plcoding.tanksmp.controllers.dto;

import com.plcoding.tanksmp.model.Game;

/**
 * Response to joining a match. The player token is returned only here, only to the joiner, and
 * must be sent back in the X-Player-Token header for the player's later commands.
 */
public record JoinMatchResponse(Game game, int playerIndex, String playerToken) {
}
