package com.plcoding.tanksmp.engine;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.Tank;
import com.plcoding.tanksmp.model.constants.GameConstants;

/** Works out how much shield each tank loses when a shell explodes. */
public final class ExplosionResolver {

    private ExplosionResolver() {
    }

    public static double explosionRadius(int actionDamage) {
        return actionDamage > 0 ? actionDamage / 2.0 : EngineConstants.DEFAULT_EXPLOSION_RADIUS;
    }

    /**
     * Tanks struck directly take the weapon's full damage. Every other tank whose center lies
     * within the explosion radius (plus half a tank width) takes splash damage that grows the
     * closer it is. A directly struck tank never takes splash damage on top.
     */
    public static ExplosionDamage calculateDamage(List<Tank> tanks, Collection<Integer> directlyStruckIndexes,
            Point2D center, int actionDamage) {
        double maxRadius = explosionRadius(actionDamage);
        int[] damagePerTank = new int[tanks.size()];
        List<Integer> struckTankIndexes = new ArrayList<>();

        for (int tankIndex = 0; tankIndex < tanks.size(); tankIndex++) {
            if (directlyStruckIndexes.contains(tankIndex)) {
                damagePerTank[tankIndex] = actionDamage;
                struckTankIndexes.add(tankIndex);
                continue;
            }
            Point2D position = tanks.get(tankIndex).getPosition();
            double tankCenterX = position.getX() + GameConstants.TANK_WIDTH / 2.0;
            double tankCenterY = position.getY() + GameConstants.TANK_HEIGHT / 2.0;
            double distance = Math.hypot(tankCenterX - center.getX(), tankCenterY - center.getY());
            double halfTankWidth = GameConstants.TANK_WIDTH / 2.0;
            if (distance <= halfTankWidth + maxRadius) {
                double approximateOverlap = Math.abs(maxRadius - (distance - halfTankWidth));
                double overlapFraction = approximateOverlap / maxRadius;
                damagePerTank[tankIndex] = (int) Math.floor(maxRadius * 2 * overlapFraction);
                struckTankIndexes.add(tankIndex);
            }
        }
        return new ExplosionDamage(damagePerTank, struckTankIndexes);
    }
}
