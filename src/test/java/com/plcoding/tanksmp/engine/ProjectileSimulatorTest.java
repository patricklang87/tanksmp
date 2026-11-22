package com.plcoding.tanksmp.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.model.Tank;
import com.plcoding.tanksmp.model.constants.GameConstants;

class ProjectileSimulatorTest {

    private final List<Point2D> terrain = EngineTestFixtures.flatTerrain();

    @Test
    void initialVelocityIsScaledByTheShotSlowingFactor() {
        double[] velocity = ProjectileSimulator.calculateInitialVelocity(-90, 50);

        assertThat(velocity[0]).isCloseTo(0, within(0.0001));
        assertThat(velocity[1]).isCloseTo(-15, within(0.0001));
    }

    @Test
    void initialVelocityAimsRightForAnglesAboveMinusNinetyAndLeftBelowIt() {
        assertThat(ProjectileSimulator.calculateInitialVelocity(-45, 50)[0]).isPositive();
        assertThat(ProjectileSimulator.calculateInitialVelocity(-135, 50)[0]).isNegative();
        assertThat(ProjectileSimulator.calculateInitialVelocity(-135, 50)[1]).isNegative();
    }

    @Test
    void shotStraightUpComesBackDownOnTheShooter() {
        Tank shooter = EngineTestFixtures.tankStandingAt(0, 700f);
        shooter.setTurretAngle(-90);

        ProjectileFlight flight = ProjectileSimulator.simulate(shooter, EngineTestFixtures.tanks(shooter), terrain);

        // A shell fired straight up lands back where it started: on the shooter's own tank.
        assertThat(flight.outcome()).isEqualTo(ProjectileOutcome.TANK_HIT);
        assertThat(flight.struckTankIndexes()).containsExactly(0);
        assertThat(flight.impactPoint().getX()).isCloseTo(700f, within(1f));
        assertThat(flight.path().get(0).getX()).isCloseTo(700f, within(0.01f));
        assertThat(flight.path().get(1).getY()).isLessThan(flight.path().get(0).getY());
    }

    @Test
    void shotAimedLeftLandsOnTheGroundToTheLeft() {
        Tank shooter = EngineTestFixtures.tankStandingAt(0, 700f);
        shooter.setTurretAngle(-135);

        ProjectileFlight flight = ProjectileSimulator.simulate(shooter, EngineTestFixtures.tanks(shooter), terrain);

        assertThat(flight.outcome()).isEqualTo(ProjectileOutcome.GROUND_HIT);
        assertThat(flight.impactPoint().getX()).isLessThan(700f);
        assertThat(flight.impactPoint().getY()).isEqualTo(EngineTestFixtures.FLAT_GROUND_Y);
        assertThat(flight.struckTankIndexes()).isEmpty();
        assertThat(flight.path().get(flight.path().size() - 1)).isEqualTo(flight.impactPoint());
    }

    @Test
    void shotLeavingTheCanvasStopsWithoutAnImpact() {
        Tank shooter = EngineTestFixtures.tankStandingAt(0, GameConstants.CANVAS_WIDTH - 30f);
        shooter.setTurretAngle(-20);
        shooter.setShotPower(100);

        ProjectileFlight flight = ProjectileSimulator.simulate(shooter, EngineTestFixtures.tanks(shooter), terrain);

        assertThat(flight.outcome()).isEqualTo(ProjectileOutcome.OUT_OF_BOUNDS);
        assertThat(flight.impactPoint()).isNull();
        assertThat(flight.struckTankIndexes()).isEmpty();
        assertThat(flight.path().get(flight.path().size() - 1).getX()).isGreaterThan(GameConstants.CANVAS_WIDTH);
    }

    @Test
    void shotHitsATankHoveringInItsPath() {
        Tank shooter = EngineTestFixtures.tankStandingAt(0, 200f);
        shooter.setTurretAngle(-45);
        ProjectileFlight emptyFlight = ProjectileSimulator.simulate(shooter, EngineTestFixtures.tanks(shooter), terrain);
        Point2D midFlight = emptyFlight.path().get(emptyFlight.path().size() / 2);
        Tank target = Tank.createDefault(1);
        target.setPosition(new Point2D(midFlight.getX() - 10f, midFlight.getY() - 5f));

        ProjectileFlight flight = ProjectileSimulator.simulate(shooter, EngineTestFixtures.tanks(shooter, target),
                terrain);

        assertThat(flight.outcome()).isEqualTo(ProjectileOutcome.TANK_HIT);
        assertThat(flight.struckTankIndexes()).containsExactly(1);
        assertThat(flight.impactPoint().getY()).isLessThan(EngineTestFixtures.FLAT_GROUND_Y);
        assertThat(flight.path().get(flight.path().size() - 1)).isEqualTo(flight.impactPoint());
    }

    @Test
    void shotLandingOnATankSittingOnTheGroundStrikesItAndTheGround() {
        Tank shooter = EngineTestFixtures.tankStandingAt(0, 200f);
        shooter.setTurretAngle(-45);
        ProjectileFlight emptyFlight = ProjectileSimulator.simulate(shooter, EngineTestFixtures.tanks(shooter), terrain);
        Tank target = EngineTestFixtures.tankStandingAt(1, emptyFlight.impactPoint().getX());

        ProjectileFlight flight = ProjectileSimulator.simulate(shooter, EngineTestFixtures.tanks(shooter, target),
                terrain);

        assertThat(flight.struckTankIndexes()).containsExactly(1);
        assertThat(flight.impactPoint()).isNotNull();
    }

    @Test
    void flightEndsAfterTheFrameThatHitsTheGround() {
        Tank shooter = EngineTestFixtures.tankStandingAt(0, 200f);
        shooter.setTurretAngle(-45);

        ProjectileFlight flight = ProjectileSimulator.simulate(shooter, EngineTestFixtures.tanks(shooter), terrain);

        List<Point2D> path = flight.path();
        for (Point2D frame : path.subList(0, path.size() - 1)) {
            assertThat(frame.getY()).isLessThanOrEqualTo(EngineTestFixtures.FLAT_GROUND_Y);
        }
    }
}
