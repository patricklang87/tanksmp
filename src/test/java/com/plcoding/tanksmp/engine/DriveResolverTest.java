package com.plcoding.tanksmp.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.constants.GameConstants;

class DriveResolverTest {

    private final List<Point2D> terrain = EngineTestFixtures.flatTerrain();

    @Test
    void targetIsClampedToTheLeftEdgeOfTheCanvas() {
        assertThat(DriveResolver.calculateTargetX(new Point2D(50f, 490f), -150)).isEqualTo(0.0);
    }

    @Test
    void targetIsClampedSoTheWholeTankStaysOnTheCanvas() {
        double rightmost = GameConstants.CANVAS_WIDTH - GameConstants.TANK_WIDTH;

        assertThat(DriveResolver.calculateTargetX(new Point2D((float) rightmost - 20, 490f), 150)).isEqualTo(rightmost);
    }

    @Test
    void requestedDistanceBeyondTheLimitIsReducedToTheLimit() {
        assertThat(DriveResolver.calculateTargetX(new Point2D(500f, 490f), 400)).isEqualTo(650.0);
        assertThat(DriveResolver.calculateTargetX(new Point2D(500f, 490f), -400)).isEqualTo(350.0);
    }

    @Test
    void pathAdvancesByTheDriveSpeedEachFrameAndEndsExactlyOnTarget() {
        DriveResolver.DriveOutcome outcome = DriveResolver.drive(new Point2D(500f, 490f), 100, terrain);

        List<Point2D> path = outcome.path();
        assertThat(path).hasSize(34); // 100 / 3 rounded up
        assertThat(path.get(0).getX()).isCloseTo(503f, within(0.001f));
        assertThat(path.get(1).getX()).isCloseTo(506f, within(0.001f));
        assertThat(outcome.finalPosition().getX()).isEqualTo(600f);
        assertThat(path.get(path.size() - 1)).isEqualTo(outcome.finalPosition());
    }

    @Test
    void drivingLeftMovesTheTankLeft() {
        DriveResolver.DriveOutcome outcome = DriveResolver.drive(new Point2D(500f, 490f), -30, terrain);

        assertThat(outcome.finalPosition().getX()).isEqualTo(470f);
        assertThat(outcome.path().get(0).getX()).isCloseTo(497f, within(0.001f));
    }

    @Test
    void tankFollowsTheTerrainHeightWhileDriving() {
        List<Point2D> slope = List.of(new Point2D(0f, 500f), new Point2D(1400f, 400f));

        DriveResolver.DriveOutcome outcome = DriveResolver.drive(new Point2D(500f, 100f), 150, slope);

        double groundAtCenter = TerrainGeometry.heightAt(slope, outcome.finalPosition().getX() + 10.0);
        assertThat((double) outcome.finalPosition().getY()).isCloseTo(groundAtCenter - 10, within(0.01));
    }

    @Test
    void zeroDistanceProducesNoPath() {
        DriveResolver.DriveOutcome outcome = DriveResolver.drive(new Point2D(500f, 490f), 0, terrain);

        assertThat(outcome.path()).isEmpty();
        assertThat(outcome.finalPosition()).isEqualTo(new Point2D(500f, 490f));
    }
}
