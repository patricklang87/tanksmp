package com.plcoding.tanksmp.engine;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.Tank;

class FallResolverTest {

    @Test
    void tankOnSolidGroundDoesNotFall() {
        Tank supported = EngineTestFixtures.tankStandingAt(0, 300f);

        List<Float> fallTargets = FallResolver.calculateFallTargets(List.of(supported), EngineTestFixtures.flatTerrain());

        assertThat(fallTargets).containsExactly((Float) null);
    }

    @Test
    void tankAboveACraterFallsToTheNewGround() {
        Tank floating = EngineTestFixtures.tankStandingAt(0, 700f);
        List<Point2D> carved = TerrainGeometry.craterAfterImpact(
                EngineTestFixtures.flatTerrain(), new Point2D(700f, 500f), 70);

        List<Float> fallTargets = FallResolver.calculateFallTargets(List.of(floating), carved);

        // The ground at the tank's center is now 35 lower; the tank's top edge settles 10 above it.
        assertThat(fallTargets.get(0)).isEqualTo(500f + 35f - 10f);
    }

    @Test
    void onlyTheUnsupportedTankFalls() {
        Tank floating = EngineTestFixtures.tankStandingAt(0, 700f);
        Tank supported = EngineTestFixtures.tankStandingAt(1, 100f);
        List<Point2D> carved = TerrainGeometry.craterAfterImpact(
                EngineTestFixtures.flatTerrain(), new Point2D(700f, 500f), 70);

        List<Float> fallTargets = FallResolver.calculateFallTargets(List.of(floating, supported), carved);

        assertThat(fallTargets.get(0)).isNotNull();
        assertThat(fallTargets.get(1)).isNull();
    }
}
