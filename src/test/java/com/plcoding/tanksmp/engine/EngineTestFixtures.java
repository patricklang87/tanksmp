package com.plcoding.tanksmp.engine;

import java.util.ArrayList;
import java.util.List;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.Tank;
import com.plcoding.tanksmp.model.constants.GameConstants;

/** Shared builders for engine tests. */
final class EngineTestFixtures {

    static final float FLAT_GROUND_Y = 500f;

    private EngineTestFixtures() {
    }

    /** Level ground across the whole canvas. */
    static List<Point2D> flatTerrain() {
        return new ArrayList<>(List.of(new Point2D(0f, FLAT_GROUND_Y),
                new Point2D((float) GameConstants.CANVAS_WIDTH, FLAT_GROUND_Y)));
    }

    /** A tank standing on flat ground whose horizontal center is at centerX. */
    static Tank tankStandingAt(int colorIndex, float centerX) {
        Tank tank = Tank.createDefault(colorIndex);
        tank.setPosition(new Point2D(centerX - GameConstants.TANK_WIDTH / 2f,
                FLAT_GROUND_Y - GameConstants.TANK_HEIGHT));
        return tank;
    }

    static List<Tank> tanks(Tank... tanks) {
        return new ArrayList<>(List.of(tanks));
    }
}
