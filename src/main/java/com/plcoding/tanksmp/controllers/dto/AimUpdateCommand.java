package com.plcoding.tanksmp.controllers.dto;

import com.plcoding.tanksmp.model.keywords.TankActionName;

import lombok.Data;
import lombok.ToString;

/**
 * Sent over STOMP by the current player while they adjust their aim. The token proves who is
 * aiming; it is never broadcast.
 */
@Data
public class AimUpdateCommand {
    @ToString.Exclude
    private String playerToken;
    private Integer turretAngle;
    private Integer shotPower;
    private TankActionName selectedActionName;
}
