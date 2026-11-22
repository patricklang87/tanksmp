package com.plcoding.tanksmp.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.engine.Cloud;
import com.plcoding.tanksmp.model.constants.GameConstants;

import lombok.Data;

@Data
public class Game {
    private String gameId;
    private List<Player> players = new ArrayList<>();
    private GameStatus gameStatus;
    private List<Point2D> topography = new ArrayList<>();
    private List<Cloud> clouds = new ArrayList<>();
    private String colorSchema;
    private int currentPlayerIndex;
    /** Who took the first turn of the current round; each rematch hands the first turn to the next player. Internal. */
    @JsonIgnore
    private int startingPlayerIndex;
    /** Index of the player who may start the match: the first to join; null until someone joins. */
    private Integer hostPlayerIndex;
    /** Null while the match continues; the survivor's index once it is over, or -1 if nobody survived. */
    private Integer winnerIndex;
    /** Number of turns resolved so far. */
    private int turnNumber;
    private int maxPlayerCount = GameConstants.MAX_PLAYERS;
    private String[] claimedColors = new String[GameConstants.MAX_PLAYERS];
    /** Used to remove abandoned matches; internal, so not part of the API. */
    @JsonIgnore
    private volatile Instant lastActivityAt;
    /** When each player's last live aim update was accepted, for rate limiting; internal and per match. */
    @JsonIgnore
    private final Map<Integer, Instant> lastAimAcceptedAtByPlayerIndex = new HashMap<>();

    /**
     * Deep copy of the match as it is right now, safe to serialize or hand to other threads while
     * the live match keeps changing. Player tokens are not carried over. Call it while holding the
     * match's lock so the copy is internally consistent.
     */
    public Game snapshot() {
        Game copy = new Game();
        copy.gameId = gameId;
        copy.players = players.stream().map(Player::snapshot).toList();
        copy.gameStatus = gameStatus;
        copy.topography = topography.stream()
                .map(point -> new Point2D(point.getX(), point.getY())).toList();
        copy.clouds = clouds.stream()
                .map(cloud -> new Cloud(new Point2D(cloud.point().getX(), cloud.point().getY()), cloud.size()))
                .toList();
        copy.colorSchema = colorSchema;
        copy.currentPlayerIndex = currentPlayerIndex;
        copy.startingPlayerIndex = startingPlayerIndex;
        copy.hostPlayerIndex = hostPlayerIndex;
        copy.winnerIndex = winnerIndex;
        copy.turnNumber = turnNumber;
        copy.maxPlayerCount = maxPlayerCount;
        copy.claimedColors = claimedColors.clone();
        copy.lastActivityAt = lastActivityAt;
        return copy;
    }

    public Game() {
        Arrays.fill(this.claimedColors, "");
    }

}
