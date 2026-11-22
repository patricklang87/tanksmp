package com.plcoding.tanksmp.engine;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.constants.GameConstants;

/** Scatters decorative clouds over the canvas. Generated once per match. */
public final class CloudGenerator {

    private final Random random;

    public CloudGenerator(Random random) {
        this.random = random;
    }

    public List<Cloud> generate() {
        int cloudCount = random.nextInt(EngineConstants.MAX_CLOUD_COUNT);
        List<Cloud> clouds = new ArrayList<>(cloudCount);
        for (int cloudIndex = 0; cloudIndex < cloudCount; cloudIndex++) {
            int size = EngineConstants.MIN_CLOUD_SIZE + random.nextInt(EngineConstants.CLOUD_SIZE_VARIATION);
            float cloudX = random.nextInt(GameConstants.CANVAS_WIDTH);
            float cloudY = random.nextInt(GameConstants.CANVAS_HEIGHT);
            clouds.add(new Cloud(new Point2D(cloudX, cloudY), size));
        }
        return clouds;
    }
}
