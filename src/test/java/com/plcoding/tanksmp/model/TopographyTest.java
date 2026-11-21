package com.plcoding.tanksmp.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;

import org.junit.jupiter.api.RepeatedTest;

import com.plcoding.tanksmp.customTypes.Point2D;

class TopographyTest {

    private static final int WIDTH = 1400;
    private static final int HEIGHT = 800;

    // Terrain is random, so repeat to exercise every landscape type.
    @RepeatedTest(25)
    void createsEvenlySpacedPointsWithinCanvasBounds() {
        ArrayList<Point2D> points = new Topography().createInitialTopography(WIDTH, HEIGHT);

        assertThat(points).hasSize(51);
        assertThat(points.get(0).getX()).isEqualTo(0f);

        float increment = WIDTH / 50;
        for (int i = 0; i < points.size(); i++) {
            Point2D point = points.get(i);
            assertThat(point.getX()).isEqualTo(i * increment);
            assertThat(point.getY()).isBetween(0f, HEIGHT * 0.8f);
        }
    }
}
