package com.plcoding.tanksmp.engine;

import java.util.ArrayList;
import java.util.List;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.constants.GameConstants;

/** Moves a tank along the terrain. */
public final class DriveResolver {

    private DriveResolver() {
    }

    /**
     * Where a tank ends up after driving.
     *
     * @param path the tank's top-left position after each frame of driving (empty if it did not move)
     * @param finalPosition the tank's final top-left position
     */
    public record DriveOutcome(List<Point2D> path, Point2D finalPosition) {
    }

    /** The x (of the tank's left edge) a tank reaches, limited to the drive range and the canvas. */
    public static double calculateTargetX(Point2D tankPosition, int requestedDriveDistance) {
        int driveDistance = Math.max(-EngineConstants.MAX_DRIVE_DISTANCE,
                Math.min(EngineConstants.MAX_DRIVE_DISTANCE, requestedDriveDistance));
        double targetX = tankPosition.getX() + driveDistance;
        double rightmostX = GameConstants.CANVAS_WIDTH - GameConstants.TANK_WIDTH;
        return Math.max(0, Math.min(rightmostX, targetX));
    }

    public static DriveOutcome drive(Point2D tankPosition, int requestedDriveDistance, List<Point2D> topography) {
        double targetX = calculateTargetX(tankPosition, requestedDriveDistance);
        double currentX = tankPosition.getX();
        double direction = targetX > currentX ? 1 : -1;
        List<Point2D> path = new ArrayList<>();
        Point2D finalPosition = tankPosition;

        while (currentX != targetX) {
            currentX = Math.abs(targetX - currentX) < EngineConstants.DRIVE_SPEED
                    ? targetX
                    : currentX + direction * EngineConstants.DRIVE_SPEED;
            double groundY = TerrainGeometry.heightAt(topography, currentX + GameConstants.TANK_WIDTH / 2.0);
            finalPosition = new Point2D((float) currentX, (float) (groundY - GameConstants.TANK_HEIGHT));
            path.add(finalPosition);
        }
        return new DriveOutcome(path, finalPosition);
    }
}
