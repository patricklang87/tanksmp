package com.plcoding.tanksmp.engine;

import java.util.ArrayList;
import java.util.List;

import com.plcoding.tanksmp.customTypes.Point2D;

/** Queries and edits the terrain polyline (canvas coordinates: smaller y is higher ground). */
public final class TerrainGeometry {

    private TerrainGeometry() {
    }

    /**
     * Height (canvas y) of the terrain at the given x, interpolated linearly between the two
     * surrounding points. Positions beyond either end use the nearest end point.
     */
    public static double heightAt(List<Point2D> topography, double positionX) {
        Point2D first = topography.get(0);
        if (positionX <= first.getX()) {
            return first.getY();
        }
        for (int index = 1; index < topography.size(); index++) {
            Point2D rightPoint = topography.get(index);
            if (rightPoint.getX() >= positionX) {
                Point2D leftPoint = topography.get(index - 1);
                double segmentWidth = rightPoint.getX() - leftPoint.getX();
                if (segmentWidth == 0) {
                    return leftPoint.getY();
                }
                double slope = (rightPoint.getY() - leftPoint.getY()) / segmentWidth;
                return leftPoint.getY() + slope * (positionX - leftPoint.getX());
            }
        }
        return topography.get(topography.size() - 1).getY();
    }

    /**
     * The new terrain after a shell of the given damage lands at the impact point: a bowl-shaped
     * crater of radius damage / 2 is carved out beneath the point.
     */
    public static List<Point2D> craterAfterImpact(List<Point2D> topography, Point2D impactPoint, int damage) {
        double craterRadius = damage / 2.0;
        if (craterRadius <= 0) {
            return new ArrayList<>(topography);
        }
        double firstX = topography.get(0).getX();
        double lastX = topography.get(topography.size() - 1).getX();
        double impactX = impactPoint.getX();
        double impactY = impactPoint.getY();

        double leftEdgeX = Math.max(impactX - craterRadius, firstX);
        double rightEdgeX = Math.min(impactX + craterRadius, lastX);

        List<Point2D> carved = new ArrayList<>();
        for (Point2D point : topography) {
            if (point.getX() < leftEdgeX) {
                carved.add(point);
            }
        }
        carved.add(new Point2D((float) leftEdgeX, (float) heightAt(topography, leftEdgeX)));
        carved.add(pointOnCircle(impactX, impactY, craterRadius, EngineConstants.CRATER_LEFT_WALL_ANGLE,
                leftEdgeX, rightEdgeX));
        carved.add(new Point2D((float) impactX, (float) (impactY + craterRadius)));
        carved.add(pointOnCircle(impactX, impactY, craterRadius, EngineConstants.CRATER_RIGHT_WALL_ANGLE,
                leftEdgeX, rightEdgeX));
        carved.add(new Point2D((float) rightEdgeX, (float) heightAt(topography, rightEdgeX)));
        for (Point2D point : topography) {
            if (point.getX() >= rightEdgeX) {
                carved.add(point);
            }
        }
        return carved;
    }

    private static Point2D pointOnCircle(double centerX, double centerY, double radius, double angleDegrees,
            double minimumX, double maximumX) {
        double angleRadians = Math.toRadians(angleDegrees);
        double pointX = Math.min(Math.max(centerX + radius * Math.cos(angleRadians), minimumX), maximumX);
        double pointY = centerY + radius * Math.sin(angleRadians);
        return new Point2D((float) pointX, (float) pointY);
    }
}
