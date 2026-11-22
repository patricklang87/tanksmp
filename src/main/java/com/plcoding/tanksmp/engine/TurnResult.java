package com.plcoding.tanksmp.engine;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.keywords.TankActionName;

/**
 * Everything that happened in one turn, in the order the client should replay it:
 * the projectile or drive path, then the explosion, hit tanks and new shields, then tanks falling
 * into any crater, ending with the new terrain and whose turn comes next.
 *
 * @param actingPlayerIndex who took the turn
 * @param actionName the action actually carried out (after any fallback to Standard Shot)
 * @param turretAngle the turret angle in degrees the acting tank had when the turn started
 * @param shotPower the shot power the acting tank had when the turn started
 * @param projectilePath projectile positions per frame; empty for a drive turn
 * @param drivePath the driving tank's top-left position per frame; empty for a fire turn
 * @param explosion the explosion, or null if the shot hit nothing
 * @param struckPlayerIndexes players caught in the explosion
 * @param shieldsAfter every player's shields after the turn
 * @param fallTargets per player the y a tank falls to, or null when it does not fall
 * @param topographyAfter the terrain after the turn
 * @param nextPlayerIndex whose turn is next
 * @param winnerIndex null while the match continues; the survivor's index once it is over, or
 *                    {@link EngineConstants#NO_SURVIVOR_INDEX} if every tank was destroyed
 */
public record TurnResult(
        int actingPlayerIndex,
        TankActionName actionName,
        int turretAngle,
        int shotPower,
        List<Point2D> projectilePath,
        List<Point2D> drivePath,
        Explosion explosion,
        List<Integer> struckPlayerIndexes,
        List<Integer> shieldsAfter,
        List<Float> fallTargets,
        List<Point2D> topographyAfter,
        int nextPlayerIndex,
        Integer winnerIndex) {

    public TurnResult {
        projectilePath = unmodifiableCopy(projectilePath);
        drivePath = unmodifiableCopy(drivePath);
        struckPlayerIndexes = unmodifiableCopy(struckPlayerIndexes);
        shieldsAfter = unmodifiableCopy(shieldsAfter);
        fallTargets = unmodifiableCopy(fallTargets);
        topographyAfter = unmodifiableCopy(topographyAfter);
    }

    private static <T> List<T> unmodifiableCopy(List<T> source) {
        // List.copyOf would reject the null entries of fallTargets.
        return Collections.unmodifiableList(new ArrayList<>(source));
    }
}
