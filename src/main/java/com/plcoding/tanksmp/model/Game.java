package com.plcoding.tanksmp.model;

import java.util.ArrayList;

import lombok.Data;

@Data
public class Game {
    private String gameId;
    private ArrayList<Player> players;
    private GameStatus gameStatus;
    // private int [][] topography;
    private String colorSchema;
    private int currentPlayerIndex;
    private int maxPlayerCount = 6;


}
