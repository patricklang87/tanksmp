package com.plcoding.tanksmp.engine;

import java.util.ArrayList;
import java.util.List;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.Tank;
import com.plcoding.tanksmp.model.constants.GameConstants;

/**
 * Simulates a shot frame by frame: the projectile leaves the turret tip, is pulled down by
 * gravity every frame, and stops when it leaves the canvas, passes through a tank or falls
 * below the terrain.
 */
public final class ProjectileSimulator {

    private ProjectileSimulator() {
    }

    /** Starting velocity {x, y} in pixels per frame for a turret angle and shot power. */
    public static double[] calculateInitialVelocity(int turretAngle, int shotPower) {
        double adjustedSpeed = shotPower * EngineConstants.SHOT_SLOWING_FACTOR;
        // Angles from -90 to 90 aim up and to the right; below -90 they aim up and to the left.
        double launchAngle = (turretAngle <= 0 && turretAngle >= -90) ? -turretAngle : turretAngle;
        int direction = turretAngle >= -90 ? 1 : -1;
        double launchRadians = Math.toRadians(launchAngle);
        double velocityX = adjustedSpeed * Math.cos(launchRadians);
        double velocityY = direction * -adjustedSpeed * Math.sin(launchRadians);
        return new double[] { velocityX, velocityY };
    }

    public static ProjectileFlight simulate(Tank shooter, List<Tank> tanks, List<Point2D> topography) {
        Point2D tip = TankPlacement.turretTip(shooter.getPosition(), shooter.getTurretAngle());
        double[] velocity = calculateInitialVelocity(shooter.getTurretAngle(), shooter.getShotPower());
        double currentX = tip.getX();
        double currentY = tip.getY();
        double velocityX = velocity[0];
        double velocityY = velocity[1];

        List<Point2D> path = new ArrayList<>();
        path.add(new Point2D((float) currentX, (float) currentY));

        // The tip itself may already be inside the ground.
        if (isBelowGround(topography, currentX, currentY)) {
            return groundHit(path, topography, tanks, currentX, currentY, currentX, currentY);
        }

        for (int frame = 0; frame < EngineConstants.MAX_PROJECTILE_FRAMES; frame++) {
            double nextX = currentX + velocityX;
            double nextY = currentY + velocityY;
            velocityY += EngineConstants.GRAVITY;

            List<Integer> struckTanks = findStruckTanks(tanks, currentX, currentY, nextX, nextY);
            boolean insideCanvasWidth = nextX >= 0 && nextX <= GameConstants.CANVAS_WIDTH;
            boolean groundStruck = insideCanvasWidth && isBelowGround(topography, nextX, nextY);

            if (groundStruck) {
                return groundHit(path, topography, tanks, currentX, currentY, nextX, nextY);
            }
            if (!struckTanks.isEmpty()) {
                // The shell explodes where it was before it reached the tank.
                Point2D impactPoint = new Point2D((float) currentX, (float) currentY);
                return new ProjectileFlight(path, ProjectileOutcome.TANK_HIT, impactPoint, struckTanks);
            }
            currentX = nextX;
            currentY = nextY;
            path.add(new Point2D((float) currentX, (float) currentY));
            if (!insideCanvasWidth || currentY > GameConstants.CANVAS_HEIGHT) {
                return new ProjectileFlight(path, ProjectileOutcome.OUT_OF_BOUNDS, null, List.of());
            }
        }
        return new ProjectileFlight(path, ProjectileOutcome.OUT_OF_BOUNDS, null, List.of());
    }

    /** Ends the flight where the segment's end point meets the terrain surface. */
    private static ProjectileFlight groundHit(List<Point2D> path, List<Point2D> topography, List<Tank> tanks,
            double segmentStartX, double segmentStartY, double segmentEndX, double segmentEndY) {
        double impactY = TerrainGeometry.heightAt(topography, segmentEndX);
        Point2D impactPoint = new Point2D((float) segmentEndX, (float) impactY);
        List<Integer> struckTanks = findStruckTanks(tanks, segmentStartX, segmentStartY, segmentEndX, segmentEndY);
        // The last frame shows the shell on the ground rather than inside it.
        path.add(impactPoint);
        return new ProjectileFlight(path, ProjectileOutcome.GROUND_HIT, impactPoint, struckTanks);
    }

    private static boolean isBelowGround(List<Point2D> topography, double positionX, double positionY) {
        if (positionX < 0 || positionX > GameConstants.CANVAS_WIDTH) {
            return false;
        }
        return TerrainGeometry.heightAt(topography, positionX) < positionY;
    }

    private static List<Integer> findStruckTanks(List<Tank> tanks, double startX, double startY, double endX,
            double endY) {
        List<Integer> struckTanks = new ArrayList<>();
        for (int tankIndex = 0; tankIndex < tanks.size(); tankIndex++) {
            Point2D position = tanks.get(tankIndex).getPosition();
            if (segmentTouchesBox(startX, startY, endX, endY, position.getX(), position.getY(),
                    position.getX() + GameConstants.TANK_WIDTH, position.getY() + GameConstants.TANK_HEIGHT)) {
                struckTanks.add(tankIndex);
            }
        }
        return struckTanks;
    }

    /** Liang-Barsky clipping: true when any part of the segment lies inside the box (edges included). */
    private static boolean segmentTouchesBox(double startX, double startY, double endX, double endY,
            double left, double top, double right, double bottom) {
        double deltaX = endX - startX;
        double deltaY = endY - startY;
        double[] directions = { -deltaX, deltaX, -deltaY, deltaY };
        double[] distancesToEdges = { startX - left, right - startX, startY - top, bottom - startY };
        double entering = 0;
        double leaving = 1;
        for (int edge = 0; edge < 4; edge++) {
            if (directions[edge] == 0) {
                if (distancesToEdges[edge] < 0) {
                    return false;
                }
                continue;
            }
            double crossing = distancesToEdges[edge] / directions[edge];
            if (directions[edge] < 0) {
                entering = Math.max(entering, crossing);
            } else {
                leaving = Math.min(leaving, crossing);
            }
            if (entering > leaving) {
                return false;
            }
        }
        return true;
    }
}
