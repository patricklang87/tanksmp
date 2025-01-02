package com.plcoding.tanksmp.model;

import java.util.ArrayList;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.constants.RgbaColor;

import lombok.Data;

@Data
public class Game {
    private String gameId;
    private ArrayList<Player> players;
    private GameStatus gameStatus;
    private ArrayList<Point2D> topography;
    private String colorSchema;
    private int currentPlayerIndex;
    private int maxPlayerCount = 6;
    private ArrayList<RgbaColor> availableColors;

}
