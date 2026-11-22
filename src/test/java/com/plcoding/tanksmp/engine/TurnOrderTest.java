package com.plcoding.tanksmp.engine;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.plcoding.tanksmp.model.Tank;

class TurnOrderTest {

    private Tank tankWithShields(int shields) {
        Tank tank = Tank.createDefault(0);
        tank.setShields(shields);
        return tank;
    }

    @Test
    void advancesToTheNextPlayer() {
        List<Tank> tanks = List.of(tankWithShields(100), tankWithShields(100), tankWithShields(100));

        assertThat(TurnOrder.nextPlayerIndex(tanks, 0)).isEqualTo(1);
    }

    @Test
    void wrapsAroundAfterTheLastPlayer() {
        List<Tank> tanks = List.of(tankWithShields(100), tankWithShields(100), tankWithShields(100));

        assertThat(TurnOrder.nextPlayerIndex(tanks, 2)).isZero();
    }

    @Test
    void skipsDestroyedTanks() {
        List<Tank> tanks = List.of(tankWithShields(100), tankWithShields(0), tankWithShields(-10), tankWithShields(40));

        assertThat(TurnOrder.nextPlayerIndex(tanks, 0)).isEqualTo(3);
    }

    @Test
    void wrapsPastDestroyedTanksAtTheEnd() {
        List<Tank> tanks = List.of(tankWithShields(100), tankWithShields(100), tankWithShields(0));

        assertThat(TurnOrder.nextPlayerIndex(tanks, 1)).isZero();
    }

    @Test
    void staysOnTheCurrentPlayerWhenNobodyElseIsAlive() {
        List<Tank> tanks = List.of(tankWithShields(100), tankWithShields(0));

        assertThat(TurnOrder.nextPlayerIndex(tanks, 0)).isZero();
    }

    @Test
    void matchContinuesWhileTwoTanksHaveShields() {
        List<Tank> tanks = List.of(tankWithShields(10), tankWithShields(0), tankWithShields(5));

        assertThat(TurnOrder.isMatchOver(tanks)).isFalse();
    }

    @Test
    void findsTheSoleSurvivorAsWinner() {
        List<Tank> tanks = List.of(tankWithShields(0), tankWithShields(0), tankWithShields(5));

        assertThat(TurnOrder.isMatchOver(tanks)).isTrue();
        assertThat(TurnOrder.findSurvivorIndex(tanks)).isEqualTo(2);
    }

    @Test
    void reportsNoSurvivorWhenEveryTankIsDestroyed() {
        List<Tank> tanks = List.of(tankWithShields(0), tankWithShields(-5));

        assertThat(TurnOrder.isMatchOver(tanks)).isTrue();
        assertThat(TurnOrder.findSurvivorIndex(tanks)).isEqualTo(EngineConstants.NO_SURVIVOR_INDEX);
    }
}
