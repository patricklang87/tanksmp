package com.plcoding.tanksmp.model;

import lombok.Data;

@Data
public class TakeTurn {
    private Integer playerIndex;
    private Integer shotPower;
    private Integer turretAngle;
    private String actionType;
    private String gameId;
}
