package com.plcoding.tanksmp.model;

import java.util.ArrayList;
import java.util.Arrays;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.constants.GameConstants;

import lombok.Data;

@Data
public class Game {
    private String gameId;
    private String id;
    private ArrayList<Player> players;
    private GameStatus gameStatus;
    private ArrayList<Point2D> topography;
    private String colorSchema;
    private int currentPlayerIndex;
    private int maxPlayerCount = GameConstants.MAX_PLAYERS;
    private String[] claimedColors = new String[GameConstants.MAX_PLAYERS];

    public Game() {
        Arrays.fill(this.claimedColors, "");
    }

}
