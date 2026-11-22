package com.plcoding.tanksmp.service;

import java.util.ArrayList;
import java.util.List;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.engine.TurnResolver;
import com.plcoding.tanksmp.engine.TurnResult;
import com.plcoding.tanksmp.model.Game;
import com.plcoding.tanksmp.model.Tank;
import com.plcoding.tanksmp.model.constants.GameConstants;

/**
 * Test arrangement of a started two-player match: level ground, the shooter (player 0) on the
 * left and a one-shield target (player 1) on the right, so a known shot ends the match.
 */
public final class FlatGroundDuel {

    private static final float FLAT_GROUND_Y = 500f;
    private static final float SHOOTER_CENTER_X = 400f;
    private static final float TARGET_CENTER_X = 700f;

    /** Aim and power for a standard shot. */
    public record Shot(int turretAngle, int shotPower) {
    }

    private FlatGroundDuel() {
    }

    public static void arrange(Game game) {
        game.setTopography(flatTopography());
        placeTank(game.getPlayers().get(0).getTank(), SHOOTER_CENTER_X);
        placeTank(game.getPlayers().get(1).getTank(), TARGET_CENTER_X);
        game.getPlayers().get(1).getTank().setShields(1);
    }

    /** Tries aim and power combinations on throwaway tanks until a standard shot destroys the target. */
    public static Shot findWinningShot() {
        for (int turretAngle = -80; turretAngle <= -10; turretAngle += 5) {
            for (int shotPower = 10; shotPower <= 100; shotPower += 2) {
                Tank shooter = Tank.createDefault(0);
                placeTank(shooter, SHOOTER_CENTER_X);
                shooter.setTurretAngle(turretAngle);
                shooter.setShotPower(shotPower);
                Tank target = Tank.createDefault(1);
                placeTank(target, TARGET_CENTER_X);
                target.setShields(1);
                TurnResult trialResult = TurnResolver.resolve(new ArrayList<>(List.of(shooter, target)),
                        flatTopography(), 0);
                if (Integer.valueOf(0).equals(trialResult.winnerIndex())) {
                    return new Shot(turretAngle, shotPower);
                }
            }
        }
        throw new AssertionError("No shot reaches the target; adjust the arrangement.");
    }

    private static List<Point2D> flatTopography() {
        return new ArrayList<>(List.of(new Point2D(0f, FLAT_GROUND_Y),
                new Point2D((float) GameConstants.CANVAS_WIDTH, FLAT_GROUND_Y)));
    }

    private static void placeTank(Tank tank, float centerX) {
        tank.setPosition(new Point2D(centerX - GameConstants.TANK_WIDTH / 2f,
                FLAT_GROUND_Y - GameConstants.TANK_HEIGHT));
    }
}
