package com.plcoding.tanksmp.engine;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Random;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.constants.GameConstants;

class TerrainGeneratorTest {

    private static final float INCREMENT_WIDTH = GameConstants.CANVAS_WIDTH / 50f;

    // Terrain is random, so try many seeds to exercise every landscape type.
    @ParameterizedTest
    @ValueSource(longs = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 })
    void createsEvenlySpacedPointsWithFlippedHeightsWithinCanvasBounds(long seed) {
        List<Point2D> points = new TerrainGenerator(new Random(seed)).generate();

        assertThat(points).hasSize(51);
        for (int pointIndex = 0; pointIndex < points.size(); pointIndex++) {
            Point2D point = points.get(pointIndex);
            assertThat(point.getX()).isEqualTo(pointIndex * INCREMENT_WIDTH);
            // Heights are flipped into canvas coordinates: ground is between 0 and 0.8 of the
            // canvas tall, so y runs from 0.2 of the canvas height down to the bottom edge.
            assertThat(point.getY()).isBetween(GameConstants.CANVAS_HEIGHT * 0.2f, (float) GameConstants.CANVAS_HEIGHT);
        }
    }

    @Test
    void sameSeedProducesSameTerrain() {
        List<Point2D> first = new TerrainGenerator(new Random(42)).generate();
        List<Point2D> second = new TerrainGenerator(new Random(42)).generate();

        assertThat(first).isEqualTo(second);
    }

    @Test
    void differentSeedsProduceDifferentTerrain() {
        List<Point2D> first = new TerrainGenerator(new Random(1)).generate();
        List<Point2D> second = new TerrainGenerator(new Random(2)).generate();

        assertThat(first).isNotEqualTo(second);
    }

    @Test
    void neighbouringPointsNeverDifferByMoreThanTheMaximumVariation() {
        List<Point2D> points = new TerrainGenerator(new Random(7)).generate();

        float maximumStep = GameConstants.CANVAS_HEIGHT * 0.05f;
        for (int pointIndex = 1; pointIndex < points.size(); pointIndex++) {
            float step = Math.abs(points.get(pointIndex).getY() - points.get(pointIndex - 1).getY());
            assertThat(step).isLessThanOrEqualTo(maximumStep + 0.01f);
        }
    }
}
