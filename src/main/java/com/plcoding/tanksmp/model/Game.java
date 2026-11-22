package com.plcoding.tanksmp.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

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

    public Game() {
        Arrays.fill(this.claimedColors, "");
    }

}
