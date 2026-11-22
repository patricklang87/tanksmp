package com.plcoding.tanksmp.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import java.util.List;
import java.util.Random;

import org.junit.jupiter.api.Test;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.constants.GameConstants;

class TankPlacementTest {

    @Test
    void placesOneTankInEachEvenRangeOfTheCanvasRestingOnTheTerrain() {
        List<Point2D> terrain = new TerrainGenerator(new Random(3)).generate();

        List<Point2D> positions = TankPlacement.generateTankPositions(terrain, 4, new Random(9));

        assertThat(positions).hasSize(4);
        double rangeWidth = GameConstants.CANVAS_WIDTH / 4.0;
        for (int tankIndex = 0; tankIndex < positions.size(); tankIndex++) {
            Point2D terrainPoint = TankPlacement.uncenterTank(positions.get(tankIndex));
            assertThat((double) terrainPoint.getX()).isBetween(tankIndex * rangeWidth, (tankIndex + 1) * rangeWidth);
            assertThat((double) terrainPoint.getY())
                    .isCloseTo(TerrainGeometry.heightAt(terrain, terrainPoint.getX()), within(0.01));
        }
    }

    @Test
    void sameSeedPlacesTanksIdentically() {
        List<Point2D> terrain = new TerrainGenerator(new Random(3)).generate();

        assertThat(TankPlacement.generateTankPositions(terrain, 3, new Random(1)))
                .isEqualTo(TankPlacement.generateTankPositions(terrain, 3, new Random(1)));
    }

    @Test
    void centerAndUncenterAreInverses() {
        Point2D terrainPoint = new Point2D(300f, 450f);

        Point2D tankPosition = TankPlacement.centerTank(terrainPoint);

        assertThat(tankPosition).isEqualTo(new Point2D(290f, 440f));
        assertThat(TankPlacement.uncenterTank(tankPosition)).isEqualTo(terrainPoint);
    }

    @Test
    void turretTipPointsStraightUpAtMinusNinetyDegrees() {
        Point2D tip = TankPlacement.turretTip(new Point2D(100f, 400f), -90);

        assertThat(tip.getX()).isCloseTo(110f, within(0.001f));
        assertThat(tip.getY()).isCloseTo(385f, within(0.001f));
    }
}
