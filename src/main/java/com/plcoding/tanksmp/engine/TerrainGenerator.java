package com.plcoding.tanksmp.engine;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.constants.GameConstants;
import com.plcoding.tanksmp.model.keywords.LandscapeType;

/**
 * Generates the random hilly terrain of a match as a polyline in canvas coordinates
 * (x grows right, y grows down, so a smaller y is higher ground).
 */
public final class TerrainGenerator {

    private final Random random;

    public TerrainGenerator(Random random) {
        this.random = random;
    }

    public List<Point2D> generate() {
        double canvasHeight = GameConstants.CANVAS_HEIGHT;
        double maxHeight = canvasHeight * EngineConstants.TERRAIN_MAX_HEIGHT_COEFFICIENT;
        double incrementWidth = (double) GameConstants.CANVAS_WIDTH / EngineConstants.TERRAIN_INCREMENTS;
        LandscapeType landscapeType = pickLandscapeType();

        // Heights are built measuring up from the bottom, then flipped into canvas coordinates.
        double height = calculateStartingHeight(landscapeType, maxHeight);
        List<Point2D> points = new ArrayList<>(EngineConstants.TERRAIN_INCREMENTS + 1);
        points.add(new Point2D(0f, (float) (canvasHeight - height)));

        double currentX = 0;
        for (int increment = 1; increment <= EngineConstants.TERRAIN_INCREMENTS; increment++) {
            currentX += incrementWidth;
            double sign = random.nextDouble() > directionThreshold(landscapeType, currentX) ? 1 : -1;
            double variation = sign * canvasHeight * EngineConstants.TERRAIN_MAX_VARIATION_COEFFICIENT
                    * random.nextDouble();
            height = Math.min(Math.max(height + variation, 0), maxHeight);
            points.add(new Point2D((float) currentX, (float) (canvasHeight - height)));
        }
        return points;
    }

    private LandscapeType pickLandscapeType() {
        LandscapeType[] landscapeTypes = LandscapeType.values();
        return landscapeTypes[random.nextInt(landscapeTypes.length)];
    }

    private double calculateStartingHeight(LandscapeType landscapeType, double maxHeight) {
        double startingHeight = switch (landscapeType) {
            case RISING, PEAK -> Math.min(random.nextDouble(), 0.1) * maxHeight;
            case FALLING, VALLEY -> Math.max(random.nextDouble(), 0.9) * maxHeight;
            case FLAT -> Math.min(random.nextDouble(), 0.3) * maxHeight;
        };
        double minHeight = EngineConstants.TERRAIN_MIN_HEIGHT_COEFFICIENT * GameConstants.CANVAS_HEIGHT;
        return Math.max(startingHeight, minHeight);
    }

    /** Chance (0 to 1) that the next step goes down; the higher it is, the more the terrain falls. */
    private double directionThreshold(LandscapeType landscapeType, double xLocation) {
        boolean pastMiddle = xLocation > GameConstants.CANVAS_WIDTH / 2.0;
        return switch (landscapeType) {
            case RISING -> 0.3;
            case FALLING -> 0.7;
            case VALLEY -> pastMiddle ? 0.1 : 0.9;
            case PEAK -> pastMiddle ? 0.9 : 0.1;
            case FLAT -> 0.5;
        };
    }
}
