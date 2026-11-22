package com.plcoding.tanksmp.controllers.dto;

import com.plcoding.tanksmp.model.keywords.TankActionName;

import lombok.Data;

/**
 * The player's choice for their turn. Fire actions need turretAngle and shotPower; the drive
 * action needs driveDistance. Fields an action does not use may be omitted.
 */
@Data
public class TurnCommand {
    private TankActionName actionName;
    private Integer turretAngle;
    private Integer shotPower;
    private Integer driveDistance;
}
