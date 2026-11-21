package com.plcoding.tanksmp.model.constants;

/** Shared game dimensions and limits. Canvas and tank sizes match the client. */
public final class GameConstants {
    public static final int CANVAS_WIDTH = 1400;
    public static final int CANVAS_HEIGHT = 600;

    public static final int MIN_PLAYERS = 2;
    public static final int MAX_PLAYERS = 6;

    public static final int MAX_PLAYER_NAME_LENGTH = 20;

    public static final int TANK_WIDTH = 20;
    public static final int TANK_HEIGHT = 10;
    public static final int TURRET_LENGTH = 15;

    private GameConstants() {
    }
}
