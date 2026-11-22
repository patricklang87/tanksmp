package com.plcoding.tanksmp.engine;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.Tank;

class ExplosionResolverTest {

    // A standard shot: damage 20, so a blast radius of 10.
    private static final int DAMAGE = 20;

    private Point2D tankCenter(Tank tank) {
        return new Point2D(tank.getPosition().getX() + 10f, tank.getPosition().getY() + 5f);
    }

    @Test
    void directlyStruckTankTakesTheFullWeaponDamage() {
        Tank target = EngineTestFixtures.tankStandingAt(0, 300f);

        ExplosionDamage damage = ExplosionResolver.calculateDamage(
                List.of(target), Set.of(0), tankCenter(target), DAMAGE);

        assertThat(damage.damagePerTank()).containsExactly(DAMAGE);
        assertThat(damage.struckTankIndexes()).containsExactly(0);
    }

    @Test
    void directlyStruckTankDoesNotAlsoTakeSplashDamage() {
        Tank target = EngineTestFixtures.tankStandingAt(0, 300f);

        // The explosion is centered inside the tank, where splash alone would exceed the weapon damage.
        ExplosionDamage damage = ExplosionResolver.calculateDamage(
                List.of(target), Set.of(0), tankCenter(target), DAMAGE);

        assertThat(damage.damagePerTank()[0]).isEqualTo(DAMAGE);
    }

    @Test
    void tankWithinTheBlastRadiusTakesSplashDamage() {
        Tank nearby = EngineTestFixtures.tankStandingAt(0, 300f);
        Point2D center = new Point2D(tankCenter(nearby).getX() + 15f, tankCenter(nearby).getY());

        ExplosionDamage damage = ExplosionResolver.calculateDamage(List.of(nearby), Set.of(), center, DAMAGE);

        // distance 15, half tank width 10, radius 10: overlap |10 - (15 - 10)| = 5, damage floor(10 * 2 * 0.5) = 10.
        assertThat(damage.damagePerTank()).containsExactly(10);
        assertThat(damage.struckTankIndexes()).containsExactly(0);
    }

    @Test
    void tankBeyondTheBlastRadiusTakesNoDamage() {
        Tank faraway = EngineTestFixtures.tankStandingAt(0, 300f);
        // Radius 10 plus half a tank width is 20; this is 21 away.
        Point2D center = new Point2D(tankCenter(faraway).getX() + 21f, tankCenter(faraway).getY());

        ExplosionDamage damage = ExplosionResolver.calculateDamage(List.of(faraway), Set.of(), center, DAMAGE);

        assertThat(damage.damagePerTank()).containsExactly(0);
        assertThat(damage.struckTankIndexes()).isEmpty();
    }

    @Test
    void eachTankIsCountedOnceWhenDirectAndSplashVictimsShareABlast() {
        Tank directHit = EngineTestFixtures.tankStandingAt(0, 300f);
        Tank bystander = EngineTestFixtures.tankStandingAt(1, 315f);
        Tank faraway = EngineTestFixtures.tankStandingAt(2, 900f);

        ExplosionDamage damage = ExplosionResolver.calculateDamage(List.of(directHit, bystander, faraway),
                Set.of(0), tankCenter(directHit), DAMAGE);

        assertThat(damage.damagePerTank()[0]).isEqualTo(DAMAGE);
        assertThat(damage.damagePerTank()[1]).isPositive();
        assertThat(damage.damagePerTank()[2]).isZero();
        assertThat(damage.struckTankIndexes()).containsExactly(0, 1);
    }

    @Test
    void explosionRadiusIsHalfTheDamage() {
        assertThat(ExplosionResolver.explosionRadius(70)).isEqualTo(35.0);
        assertThat(ExplosionResolver.explosionRadius(0)).isEqualTo(EngineConstants.DEFAULT_EXPLOSION_RADIUS);
    }
}
