package com.plcoding.tanksmp.model.tankActions;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.plcoding.tanksmp.model.keywords.TankActionName;

class TankActionsTest {

    private final TankActions tankActions = new TankActions();

    @Test
    void standardShotHasItsOwnNameAndUnlimitedRounds() {
        assertThat(tankActions.getStandardShot().getName()).isEqualTo(TankActionName.STANDARD_SHOT);
        assertThat(tankActions.getStandardShot().getRounds()).isNull();
    }

    @Test
    void steelShotputHasThreeRounds() {
        assertThat(tankActions.getSteelShotput().getRounds()).isEqualTo(3);
    }

    @Test
    void begemotDealsSeventyDamageWithASingleRound() {
        assertThat(tankActions.getBegemot().getName()).isEqualTo(TankActionName.BEGEMOT);
        assertThat(tankActions.getBegemot().getDamage()).isEqualTo(70);
        assertThat(tankActions.getBegemot().getRounds()).isEqualTo(1);
    }

    @Test
    void driveHasUnlimitedRounds() {
        assertThat(tankActions.getDrive().getRounds()).isNull();
    }
}
