package com.plcoding.tanksmp.engine;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.Tank;
import com.plcoding.tanksmp.model.keywords.TankActionName;

class TurnResolverTest {

    private final List<Point2D> terrain = EngineTestFixtures.flatTerrain();

    /** Two tanks on flat ground; the shooter aims at the target using a dry run to find the landing spot. */
    private List<Tank> shooterAndTargetInRange() {
        Tank shooter = EngineTestFixtures.tankStandingAt(0, 200f);
        shooter.setTurretAngle(-45);
        ProjectileFlight dryRun = ProjectileSimulator.simulate(shooter, EngineTestFixtures.tanks(shooter), terrain);
        Tank target = EngineTestFixtures.tankStandingAt(1, dryRun.impactPoint().getX());
        return EngineTestFixtures.tanks(shooter, target);
    }

    @Test
    void firingAtATankDamagesItAndReportsTheExplosion() {
        List<Tank> tanks = shooterAndTargetInRange();

        TurnResult result = TurnResolver.resolve(tanks, terrain, 0);

        assertThat(result.actingPlayerIndex()).isZero();
        assertThat(result.actionName()).isEqualTo(TankActionName.STANDARD_SHOT);
        assertThat(result.projectilePath()).isNotEmpty();
        assertThat(result.drivePath()).isEmpty();
        assertThat(result.struckPlayerIndexes()).containsExactly(1);
        assertThat(result.shieldsAfter()).containsExactly(100, 80);
        assertThat(result.explosion().maxRadius()).isEqualTo(10f);
        assertThat(result.explosion().color()).containsExactly(250, 183, 0);
        assertThat(tanks.get(1).getShields()).isEqualTo(80);
        assertThat(result.nextPlayerIndex()).isEqualTo(1);
        assertThat(result.winnerIndex()).isNull();
    }

    @Test
    void groundHitCarvesACraterAndLeavesTheTankFalling() {
        Tank shooter = EngineTestFixtures.tankStandingAt(0, 700f);
        shooter.setTurretAngle(-135);
        Tank bystander = EngineTestFixtures.tankStandingAt(1, 1000f);
        List<Tank> tanks = EngineTestFixtures.tanks(shooter, bystander);

        TurnResult result = TurnResolver.resolve(tanks, terrain, 0);

        assertThat(result.explosion()).isNotNull();
        assertThat(result.topographyAfter().size()).isGreaterThan(terrain.size());
        assertThat(terrain).hasSize(2); // the input terrain is untouched
        assertThat(result.fallTargets()).hasSize(2);
    }

    @Test
    void shotThatLeavesTheCanvasCausesNoExplosionAndPassesTheTurn() {
        Tank shooter = EngineTestFixtures.tankStandingAt(0, 1380f);
        shooter.setTurretAngle(-20);
        shooter.setShotPower(100);
        Tank other = EngineTestFixtures.tankStandingAt(1, 100f);

        TurnResult result = TurnResolver.resolve(EngineTestFixtures.tanks(shooter, other), terrain, 0);

        assertThat(result.explosion()).isNull();
        assertThat(result.struckPlayerIndexes()).isEmpty();
        assertThat(result.topographyAfter()).isEqualTo(terrain);
        assertThat(result.shieldsAfter()).containsExactly(100, 100);
        assertThat(result.nextPlayerIndex()).isEqualTo(1);
    }

    @Test
    void firingALimitedWeaponUsesUpOneRound() {
        List<Tank> tanks = shooterAndTargetInRange();
        Tank shooter = tanks.get(0);
        shooter.setSelectedAction(TankActionName.STEEL_SHOTPUT);

        TurnResult result = TurnResolver.resolve(tanks, terrain, 0);

        assertThat(result.actionName()).isEqualTo(TankActionName.STEEL_SHOTPUT);
        assertThat(shooter.getRemainingRounds().get(TankActionName.STEEL_SHOTPUT)).isEqualTo(2);
        assertThat(shooter.getSelectedAction()).isEqualTo(TankActionName.STEEL_SHOTPUT);
    }

    @Test
    void firingTheLastRoundSwitchesBackToTheStandardShot() {
        List<Tank> tanks = shooterAndTargetInRange();
        Tank shooter = tanks.get(0);
        shooter.setSelectedAction(TankActionName.BEGEMOT);

        TurnResult result = TurnResolver.resolve(tanks, terrain, 0);

        assertThat(result.actionName()).isEqualTo(TankActionName.BEGEMOT);
        assertThat(shooter.getRemainingRounds().get(TankActionName.BEGEMOT)).isZero();
        assertThat(shooter.getSelectedAction()).isEqualTo(TankActionName.STANDARD_SHOT);
    }

    @Test
    void anEmptyWeaponFallsBackToTheStandardShot() {
        List<Tank> tanks = shooterAndTargetInRange();
        Tank shooter = tanks.get(0);
        shooter.setSelectedAction(TankActionName.BEGEMOT);
        shooter.getRemainingRounds().put(TankActionName.BEGEMOT, 0);

        TurnResult result = TurnResolver.resolve(tanks, terrain, 0);

        assertThat(result.actionName()).isEqualTo(TankActionName.STANDARD_SHOT);
        assertThat(result.explosion().maxRadius()).isEqualTo(10f);
        assertThat(shooter.getRemainingRounds().get(TankActionName.BEGEMOT)).isZero();
        assertThat(shooter.getSelectedAction()).isEqualTo(TankActionName.STANDARD_SHOT);
    }

    @Test
    void standardShotHasUnlimitedRounds() {
        List<Tank> tanks = shooterAndTargetInRange();

        TurnResolver.resolve(tanks, terrain, 0);

        assertThat(tanks.get(0).getRemainingRounds()).doesNotContainKey(TankActionName.STANDARD_SHOT);
    }

    @Test
    void drivingMovesTheTankAndRecordsThePath() {
        Tank driver = EngineTestFixtures.tankStandingAt(0, 500f);
        driver.setSelectedAction(TankActionName.DRIVE);
        driver.setDriveDistance(60);
        Tank other = EngineTestFixtures.tankStandingAt(1, 900f);

        TurnResult result = TurnResolver.resolve(EngineTestFixtures.tanks(driver, other), terrain, 0);

        assertThat(result.actionName()).isEqualTo(TankActionName.DRIVE);
        assertThat(result.projectilePath()).isEmpty();
        assertThat(result.drivePath()).hasSize(20);
        assertThat(result.explosion()).isNull();
        assertThat(driver.getPosition().getX()).isEqualTo(550f);
        assertThat(result.nextPlayerIndex()).isEqualTo(1);
    }

    @Test
    void destroyingTheLastOpponentEndsTheMatch() {
        List<Tank> tanks = shooterAndTargetInRange();
        tanks.get(1).setShields(15);

        TurnResult result = TurnResolver.resolve(tanks, terrain, 0);

        assertThat(result.shieldsAfter()).containsExactly(100, 0);
        assertThat(result.winnerIndex()).isZero();
    }

    @Test
    void nextPlayerSkipsDestroyedTanks() {
        List<Tank> tanks = shooterAndTargetInRange();
        Tank third = EngineTestFixtures.tankStandingAt(2, 1300f);
        tanks.add(third);
        tanks.get(1).setShields(15);

        TurnResult result = TurnResolver.resolve(tanks, terrain, 0);

        assertThat(result.nextPlayerIndex()).isEqualTo(2);
        assertThat(result.winnerIndex()).isNull();
    }
}
