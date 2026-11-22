package com.plcoding.tanksmp.engine;

import java.util.List;

import com.plcoding.tanksmp.model.Tank;

/** Decides whose turn is next and when the match is over. */
public final class TurnOrder {

    private TurnOrder() {
    }

    public static boolean isAlive(Tank tank) {
        return tank.getShields() > 0;
    }

    /**
     * The next living player after the current one, wrapping around. If nobody else is alive the
     * current index is returned.
     */
    public static int nextPlayerIndex(List<Tank> tanks, int currentIndex) {
        int candidate = (currentIndex + 1) % tanks.size();
        while (!isAlive(tanks.get(candidate)) && candidate != currentIndex) {
            candidate = (candidate + 1) % tanks.size();
        }
        return candidate;
    }

    /** The match ends once fewer than two tanks still have shields. */
    public static boolean isMatchOver(List<Tank> tanks) {
        return tanks.stream().filter(TurnOrder::isAlive).count() < 2;
    }

    /** Index of the sole survivor, or {@link EngineConstants#NO_SURVIVOR_INDEX} if everyone is destroyed. */
    public static int findSurvivorIndex(List<Tank> tanks) {
        for (int tankIndex = 0; tankIndex < tanks.size(); tankIndex++) {
            if (isAlive(tanks.get(tankIndex))) {
                return tankIndex;
            }
        }
        return EngineConstants.NO_SURVIVOR_INDEX;
    }
}
