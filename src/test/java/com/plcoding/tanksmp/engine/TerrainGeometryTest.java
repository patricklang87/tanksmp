package com.plcoding.tanksmp.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.plcoding.tanksmp.customTypes.Point2D;

class TerrainGeometryTest {

    private final List<Point2D> slopedTerrain = List.of(
            new Point2D(0f, 400f), new Point2D(100f, 300f), new Point2D(200f, 300f));

    @Test
    void heightAtInterpolatesBetweenNeighbouringPoints() {
        assertThat(TerrainGeometry.heightAt(slopedTerrain, 50)).isCloseTo(350, within(0.001));
        assertThat(TerrainGeometry.heightAt(slopedTerrain, 150)).isCloseTo(300, within(0.001));
    }

    @Test
    void heightAtReturnsThePointHeightExactlyAtAPoint() {
        assertThat(TerrainGeometry.heightAt(slopedTerrain, 100)).isCloseTo(300, within(0.001));
    }

    @Test
    void heightAtClampsBeyondTheEnds() {
        assertThat(TerrainGeometry.heightAt(slopedTerrain, -10)).isCloseTo(400, within(0.001));
        assertThat(TerrainGeometry.heightAt(slopedTerrain, 250)).isCloseTo(300, within(0.001));
    }

    @Test
    void craterLowersTheTerrainWithinItsRadius() {
        List<Point2D> flat = EngineTestFixtures.flatTerrain();
        Point2D impact = new Point2D(700f, EngineTestFixtures.FLAT_GROUND_Y);
        int damage = 70; // crater radius 35

        List<Point2D> carved = TerrainGeometry.craterAfterImpact(flat, impact, damage);

        // Larger y is lower ground.
        assertThat(TerrainGeometry.heightAt(carved, 700)).isCloseTo(500 + 35, within(0.01));
        assertThat(TerrainGeometry.heightAt(carved, 690)).isGreaterThan(500);
        assertThat(TerrainGeometry.heightAt(carved, 710)).isGreaterThan(500);
    }

    @Test
    void craterLeavesTheTerrainOutsideItsRadiusUntouched() {
        List<Point2D> carved = TerrainGeometry.craterAfterImpact(
                EngineTestFixtures.flatTerrain(), new Point2D(700f, 500f), 70);

        assertThat(TerrainGeometry.heightAt(carved, 600)).isCloseTo(500, within(0.001));
        assertThat(TerrainGeometry.heightAt(carved, 800)).isCloseTo(500, within(0.001));
        assertThat(TerrainGeometry.heightAt(carved, 664)).isCloseTo(500, within(0.001));
    }

    @Test
    void craterKeepsPointsInAscendingXOrder() {
        List<Point2D> carved = TerrainGeometry.craterAfterImpact(
                EngineTestFixtures.flatTerrain(), new Point2D(700f, 500f), 70);

        for (int pointIndex = 1; pointIndex < carved.size(); pointIndex++) {
            assertThat(carved.get(pointIndex).getX()).isGreaterThanOrEqualTo(carved.get(pointIndex - 1).getX());
        }
    }

    @Test
    void craterAtTheCanvasEdgeStaysWithinTheTerrainSpan() {
        List<Point2D> carved = TerrainGeometry.craterAfterImpact(
                EngineTestFixtures.flatTerrain(), new Point2D(5f, 500f), 70);

        assertThat(carved.get(0).getX()).isGreaterThanOrEqualTo(0f);
        assertThat(carved).allSatisfy(point -> assertThat(point.getY()).isNotNaN());
    }

    @Test
    void craterDoesNotModifyItsInput() {
        List<Point2D> flat = EngineTestFixtures.flatTerrain();

        TerrainGeometry.craterAfterImpact(flat, new Point2D(700f, 500f), 70);

        assertThat(flat).hasSize(2);
    }
}
