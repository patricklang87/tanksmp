package com.plcoding.tanksmp.model.tankActions;

import com.plcoding.tanksmp.model.keywords.ActionType;
// import com.plcoding.tanksmp.model.TankAction;
import com.plcoding.tanksmp.model.keywords.TankActionName;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TankActions {
    TankAction standardShot = new TankAction(TankActionName.STEEL_SHOTPUT, "Standard Shot", 20,          ActionType.PROJECTILE, 0,
            new int[] { 250, 183, 0 }, false);
    TankAction steelShotput = new TankAction(TankActionName.STEEL_SHOTPUT, "Steel Shotput", 35, ActionType.PROJECTILE, 3,
            new int[] { 250, 183, 0 }, true);
    TankAction drive = new TankAction(TankActionName.DRIVE, "Drive", 0, ActionType.DRIVE, 0, null, false);
}
