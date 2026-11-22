package com.plcoding.tanksmp.model;

import java.util.EnumMap;
import java.util.Map;

import com.plcoding.tanksmp.customTypes.Point2D;
import com.plcoding.tanksmp.engine.EngineConstants;
import com.plcoding.tanksmp.model.keywords.ActionType;
import com.plcoding.tanksmp.model.keywords.TankActionName;
import com.plcoding.tanksmp.model.tankActions.TankAction;
import com.plcoding.tanksmp.model.tankActions.TankActions;

import lombok.Data;

@Data
public class Tank {
    /** Index into the shared tank color palette, 0 to 5. */
    private int colorIndex;
    /** Top-left corner of the tank in canvas coordinates; null until the match starts. */
    private Point2D position;
    /** Degrees; -90 points straight up, -180 and 0 point left and right. */
    private int turretAngle = EngineConstants.DEFAULT_TURRET_ANGLE;
    private int shotPower = EngineConstants.DEFAULT_SHOT_POWER;
    /** Signed horizontal distance the tank will drive on its next drive turn. */
    private int driveDistance;
    private int shields = EngineConstants.INITIAL_SHIELDS;
    private TankActions tankActions = new TankActions();
    private TankActionName selectedAction = TankActionName.STANDARD_SHOT;
    /** Rounds left per limited weapon; weapons without an entry have unlimited use. */
    private Map<TankActionName, Integer> remainingRounds = new EnumMap<>(TankActionName.class);

    public static Tank createDefault(int colorIndex) {
        Tank tank = new Tank();
        tank.colorIndex = colorIndex;
        for (TankAction action : tank.tankActions.all()) {
            if (action.getType() == ActionType.PROJECTILE && action.getRounds() != null) {
                tank.remainingRounds.put(action.getName(), action.getRounds());
            }
        }
        return tank;
    }
}
