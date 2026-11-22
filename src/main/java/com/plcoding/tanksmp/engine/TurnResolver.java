package com.plcoding.tanksmp.engine;

import java.util.ArrayList;
import java.util.List;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.Tank;
import com.plcoding.tanksmp.model.keywords.ActionType;
import com.plcoding.tanksmp.model.keywords.TankActionName;
import com.plcoding.tanksmp.model.tankActions.TankAction;

/** Runs one turn of the game and reports what happened. */
public final class TurnResolver {

    private TurnResolver() {
    }

    /**
     * Resolves the acting tank's selected action (its aim, power or drive distance must already be
     * set and validated). The tanks are updated in place: shields, positions, remaining rounds and
     * selected action. The terrain is not modified; the new terrain is in the result.
     */
    public static TurnResult resolve(List<Tank> tanks, List<Point2D> topography, int actingPlayerIndex) {
        Tank actingTank = tanks.get(actingPlayerIndex);
        TankAction action = actingTank.getTankActions().findByName(actingTank.getSelectedAction());
        if (action.getType() == ActionType.DRIVE) {
            return resolveDrive(tanks, topography, actingPlayerIndex);
        }
        if (!hasRoundsLeft(actingTank, action)) {
            actingTank.setSelectedAction(TankActionName.STANDARD_SHOT);
            action = actingTank.getTankActions().getStandardShot();
        }
        return resolveFire(tanks, topography, actingPlayerIndex, action);
    }

    private static TurnResult resolveDrive(List<Tank> tanks, List<Point2D> topography, int actingPlayerIndex) {
        Tank actingTank = tanks.get(actingPlayerIndex);
        DriveResolver.DriveOutcome outcome = DriveResolver.drive(actingTank.getPosition(),
                actingTank.getDriveDistance(), topography);
        actingTank.setPosition(outcome.finalPosition());
        return buildResult(tanks, topography, actingPlayerIndex, TankActionName.DRIVE, List.of(), outcome.path(),
                null, List.of(), emptyFallTargets(tanks.size()));
    }

    private static TurnResult resolveFire(List<Tank> tanks, List<Point2D> topography, int actingPlayerIndex,
            TankAction action) {
        Tank actingTank = tanks.get(actingPlayerIndex);
        useUpRound(actingTank, action);

        ProjectileFlight flight = ProjectileSimulator.simulate(actingTank, tanks, topography);
        if (flight.outcome() == ProjectileOutcome.OUT_OF_BOUNDS) {
            return buildResult(tanks, topography, actingPlayerIndex, action.getName(), flight.path(), List.of(),
                    null, List.of(), emptyFallTargets(tanks.size()));
        }

        Point2D impactPoint = flight.impactPoint();
        Explosion explosion = new Explosion(impactPoint, (float) ExplosionResolver.explosionRadius(action.getDamage()),
                action.getExplosionColor());
        ExplosionDamage damage = ExplosionResolver.calculateDamage(tanks, flight.struckTankIndexes(), impactPoint,
                action.getDamage());
        for (int tankIndex = 0; tankIndex < tanks.size(); tankIndex++) {
            Tank tank = tanks.get(tankIndex);
            tank.setShields(Math.max(0, tank.getShields() - damage.damagePerTank()[tankIndex]));
        }

        List<Point2D> newTopography = topography;
        if (flight.outcome() == ProjectileOutcome.GROUND_HIT) {
            newTopography = TerrainGeometry.craterAfterImpact(topography, impactPoint, action.getDamage());
        }
        List<Float> fallTargets = FallResolver.calculateFallTargets(tanks, newTopography);
        for (int tankIndex = 0; tankIndex < tanks.size(); tankIndex++) {
            Float fallTarget = fallTargets.get(tankIndex);
            if (fallTarget != null) {
                Point2D position = tanks.get(tankIndex).getPosition();
                tanks.get(tankIndex).setPosition(new Point2D(position.getX(), fallTarget));
            }
        }
        return buildResult(tanks, newTopography, actingPlayerIndex, action.getName(), flight.path(), List.of(),
                explosion, damage.struckTankIndexes(), fallTargets);
    }

    private static TurnResult buildResult(List<Tank> tanks, List<Point2D> topographyAfter, int actingPlayerIndex,
            TankActionName actionName, List<Point2D> projectilePath, List<Point2D> drivePath, Explosion explosion,
            List<Integer> struckPlayerIndexes, List<Float> fallTargets) {
        Tank actingTank = tanks.get(actingPlayerIndex);
        fallBackToStandardShotIfOutOfRounds(actingTank);
        List<Integer> shieldsAfter = new ArrayList<>();
        tanks.forEach(tank -> shieldsAfter.add(tank.getShields()));
        Integer winnerIndex = TurnOrder.isMatchOver(tanks) ? TurnOrder.findSurvivorIndex(tanks) : null;
        return new TurnResult(actingPlayerIndex, actionName, actingTank.getTurretAngle(),
                actingTank.getShotPower(), projectilePath, drivePath, explosion,
                struckPlayerIndexes, shieldsAfter, fallTargets, topographyAfter,
                TurnOrder.nextPlayerIndex(tanks, actingPlayerIndex), winnerIndex);
    }

    private static boolean hasRoundsLeft(Tank tank, TankAction action) {
        Integer rounds = tank.getRemainingRounds().get(action.getName());
        return rounds == null || rounds > 0;
    }

    private static void useUpRound(Tank tank, TankAction action) {
        tank.getRemainingRounds().computeIfPresent(action.getName(), (name, rounds) -> rounds - 1);
    }

    /** A limited weapon that has just run out is swapped for the Standard Shot. */
    private static void fallBackToStandardShotIfOutOfRounds(Tank tank) {
        TankAction selected = tank.getTankActions().findByName(tank.getSelectedAction());
        if (selected.getType() == ActionType.PROJECTILE && !hasRoundsLeft(tank, selected)) {
            tank.setSelectedAction(TankActionName.STANDARD_SHOT);
        }
    }

    private static List<Float> emptyFallTargets(int tankCount) {
        List<Float> fallTargets = new ArrayList<>(tankCount);
        for (int tankIndex = 0; tankIndex < tankCount; tankIndex++) {
            fallTargets.add(null);
        }
        return fallTargets;
    }
}
