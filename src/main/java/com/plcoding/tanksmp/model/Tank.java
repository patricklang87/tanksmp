package com.plcoding.tanksmp.model;

import lombok.Data;

@Data
public class Tank {
    private Float[] localColor;
    private Float[] position;
    private Integer turretAngle;
    private Integer driveDistance;
    private Integer shields;
    private Float targetX; 
    private Float targetY;
    // private Action[] availableActions;
    private String selectedAction;

    public Tank initializeTank(Float[] requestedColor) {
        Tank tank = new Tank();
        tank.localColor = requestedColor;
        // tank.position //
        tank.turretAngle = 90;
        tank.driveDistance = 0;
        tank.shields = 100;
        tank.targetX = 100f;
        tank.targetY = 100f;
        return tank;
    }
}
