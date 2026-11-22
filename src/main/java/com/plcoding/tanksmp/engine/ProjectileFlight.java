package com.plcoding.tanksmp.engine;

import java.util.List;

import com.plcoding.tanksmp.customTypes.Point2D;

/**
 * A simulated shot.
 *
 * @param path the projectile position in every frame, from the turret tip to its final frame
 *             (the impact point for a hit, the first position outside the canvas otherwise)
 * @param outcome how the flight ended
 * @param impactPoint where the shell struck; null when it left the canvas
 * @param struckTankIndexes tanks whose bounding box the projectile passed through on the last frame
 */
public record ProjectileFlight(List<Point2D> path, ProjectileOutcome outcome, Point2D impactPoint,
        List<Integer> struckTankIndexes) {
}
