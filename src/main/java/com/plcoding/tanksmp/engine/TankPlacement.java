package com.plcoding.tanksmp.engine;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.constants.GameConstants;

/**
 * Tank positions. A tank's position is its top-left corner; the "terrain point" of a tank is the
 * spot on the ground directly beneath its horizontal center.
 */
public final class TankPlacement {

    private TankPlacement() {
    }

    /**
     * Splits the canvas into one equal range per tank and picks a random x inside each range, so
     * tanks start spread out left to right. Returns top-left tank positions resting on the terrain.
     */
    public static List<Point2D> generateTankPositions(List<Point2D> topography, int tankCount, Random random) {
        double rangeWidth = (double) GameConstants.CANVAS_WIDTH / tankCount;
        List<Point2D> positions = new ArrayList<>(tankCount);
        for (int tankIndex = 0; tankIndex < tankCount; tankIndex++) {
            double tankX = tankIndex * rangeWidth + random.nextDouble() * rangeWidth;
            double tankY = TerrainGeometry.heightAt(topography, tankX);
            positions.add(centerTank(new Point2D((float) tankX, (float) tankY)));
        }
        return positions;
    }

    /** Converts a point on the ground into the top-left corner of a tank standing there. */
    public static Point2D centerTank(Point2D terrainPoint) {
        return new Point2D(terrainPoint.getX() - GameConstants.TANK_WIDTH / 2f,
                terrainPoint.getY() - GameConstants.TANK_HEIGHT);
    }

    /** Inverse of {@link #centerTank}. */
    public static Point2D uncenterTank(Point2D tankPosition) {
        return new Point2D(tankPosition.getX() + GameConstants.TANK_WIDTH / 2f,
                tankPosition.getY() + GameConstants.TANK_HEIGHT);
    }

    /**
     * Tip of the turret, from which projectiles launch. The turret pivots at the top center of
     * the tank; the angle is in degrees with -90 pointing straight up.
     */
    public static Point2D turretTip(Point2D tankPosition, int turretAngle) {
        double pivotX = tankPosition.getX() + GameConstants.TANK_WIDTH / 2.0;
        double pivotY = tankPosition.getY();
        double angleRadians = Math.toRadians(turretAngle);
        return new Point2D((float) (pivotX + GameConstants.TURRET_LENGTH * Math.cos(angleRadians)),
                (float) (pivotY + GameConstants.TURRET_LENGTH * Math.sin(angleRadians)));
    }
}
