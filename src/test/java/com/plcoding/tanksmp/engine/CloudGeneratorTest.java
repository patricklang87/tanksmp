package com.plcoding.tanksmp.engine;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Random;

import org.junit.jupiter.api.Test;

import com.plcoding.tanksmp.model.constants.GameConstants;

class CloudGeneratorTest {

    @Test
    void cloudsStayWithinTheCanvasAndSizeLimits() {
        for (long seed = 0; seed < 30; seed++) {
            List<Cloud> clouds = new CloudGenerator(new Random(seed)).generate();

            assertThat(clouds.size()).isLessThan(EngineConstants.MAX_CLOUD_COUNT);
            for (Cloud cloud : clouds) {
                assertThat(cloud.size()).isBetween(10, 49);
                assertThat(cloud.point().getX()).isBetween(0f, (float) GameConstants.CANVAS_WIDTH);
                assertThat(cloud.point().getY()).isBetween(0f, (float) GameConstants.CANVAS_HEIGHT);
            }
        }
    }

    @Test
    void sameSeedProducesSameClouds() {
        assertThat(new CloudGenerator(new Random(5)).generate())
                .isEqualTo(new CloudGenerator(new Random(5)).generate());
    }
}
