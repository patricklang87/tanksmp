package com.plcoding.tanksmp.engine;

import java.util.ArrayList;
import java.util.List;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.Tank;
import com.plcoding.tanksmp.model.constants.GameConstants;

/** Finds tanks left floating after a crater removed the ground beneath them. */
public final class FallResolver {

    private FallResolver() {
    }

    /**
     * For each tank, the y its top edge should settle at, or null if it is still supported.
     * The list is indexed like the tank list.
     */
    public static List<Float> calculateFallTargets(List<Tank> tanks, List<Point2D> topography) {
        List<Float> fallTargets = new ArrayList<>(tanks.size());
        for (Tank tank : tanks) {
            Point2D position = tank.getPosition();
            double centerX = position.getX() + GameConstants.TANK_WIDTH / 2.0;
            double bottomOfTank = position.getY() + GameConstants.TANK_HEIGHT;
            double groundY = TerrainGeometry.heightAt(topography, centerX);
            boolean floating = groundY > bottomOfTank;
            fallTargets.add(floating ? (float) (groundY - GameConstants.TANK_HEIGHT) : null);
        }
        return fallTargets;
    }
}
