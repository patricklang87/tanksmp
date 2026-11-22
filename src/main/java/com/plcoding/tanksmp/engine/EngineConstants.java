package com.plcoding.tanksmp.engine;

/**
 * Tuning values for the game engine. They mirror the constants of the original single-player
 * game (tanks_2 constants.ts) so that shots, drives and explosions behave identically.
 * Canvas and tank dimensions live in {@link com.plcoding.tanksmp.model.constants.GameConstants}.
 */
public final class EngineConstants {
    /** Downward acceleration of a projectile, in pixels per frame squared. */
    public static final double GRAVITY = 0.5;
    /** Scales the shot power into the projectile's starting speed. */
    public static final double SHOT_SLOWING_FACTOR = 0.3;
    /** Horizontal distance a driving tank covers per frame. */
    public static final double DRIVE_SPEED = 3;
    /** Vertical distance a falling tank covers per frame (used when animating a fall). */
    public static final double FALL_SPEED = 3;
    /** Radius growth of an explosion per frame (used when animating an explosion). */
    public static final double EXPLOSION_RATE = 0.5;

    public static final int INITIAL_SHIELDS = 100;
    public static final int DEFAULT_TURRET_ANGLE = -90;
    public static final int DEFAULT_SHOT_POWER = 50;

    /** Turret angles a player may request, in degrees (-180 points left, 0 points right). */
    public static final int MIN_TURRET_ANGLE = -180;
    public static final int MAX_TURRET_ANGLE = 0;
    public static final int MIN_SHOT_POWER = 0;
    public static final int MAX_SHOT_POWER = 100;

    /** A tank may drive at most this far (in either direction) in a single turn. */
    public static final int MAX_DRIVE_DISTANCE = 150;

    /** Explosion radius used when an action deals no damage. */
    public static final double DEFAULT_EXPLOSION_RADIUS = 5;

    /** Safety net so a malformed shot can never simulate forever. */
    public static final int MAX_PROJECTILE_FRAMES = 10_000;

    /** Returned as the winner when every tank is destroyed in the same turn. */
    public static final int NO_SURVIVOR_INDEX = -1;

    public static final int TERRAIN_INCREMENTS = 50;
    public static final double TERRAIN_MAX_VARIATION_COEFFICIENT = 0.05;
    public static final double TERRAIN_MIN_HEIGHT_COEFFICIENT = 0.2;
    public static final double TERRAIN_MAX_HEIGHT_COEFFICIENT = 0.8;

    /** Angle, in degrees, of the crater wall points relative to the impact point. */
    public static final double CRATER_RIGHT_WALL_ANGLE = 45;
    public static final double CRATER_LEFT_WALL_ANGLE = -225;

    public static final int MAX_CLOUD_COUNT = 15;
    public static final int MIN_CLOUD_SIZE = 10;
    public static final int CLOUD_SIZE_VARIATION = 40;

    private EngineConstants() {
    }
}
