package com.plcoding.tanksmp.model;

import com.plcoding.tanksmp.model.keywords.TankActionName;
import com.plcoding.tanksmp.model.tankActions.TankActions;

import lombok.Data;

@Data
public class Tank {
    // private Float[] localColor;
    private Integer requestedColor;
    private Float[] position;
    private Integer turretAngle;
    private Integer driveDistance;
    private Integer shields;
    private Float targetX; 
    private Float targetY;
    private TankActions tankActions;
    private TankActionName selectedAction;

    public Tank initializeTank(Integer requestedColor) {
        Tank tank = new Tank();
        tank.requestedColor = requestedColor;
        // tank.localColor = localColor;
        // tank.position //
        tank.turretAngle = 90;
        tank.driveDistance = 0;
        tank.shields = 100;
        tank.targetX = 100f;
        tank.targetY = 100f;
        tank.selectedAction = TankActionName.STANDARD_SHOT;
        tank.tankActions = new TankActions();
        return tank;
    }
}
