package com.plcoding.tanksmp.model.tankActions;

import com.plcoding.tanksmp.model.keywords.ActionType;
import com.plcoding.tanksmp.model.keywords.TankActionName;

import lombok.Data;
import lombok.NoArgsConstructor;

/** Actions available to a tank. A null number of rounds means unlimited use. */
@Data
@NoArgsConstructor
public class TankActions {
    TankAction standardShot = new TankAction(TankActionName.STANDARD_SHOT, "Standard Shot", 20,
            ActionType.PROJECTILE, null, new int[] { 250, 183, 0 }, false);
    TankAction steelShotput = new TankAction(TankActionName.STEEL_SHOTPUT, "Steel Shotput", 35,
            ActionType.PROJECTILE, 3, new int[] { 250, 183, 0 }, true);
    TankAction begemot = new TankAction(TankActionName.BEGEMOT, "Begemot", 70,
            ActionType.PROJECTILE, 1, new int[] { 241, 90, 34 }, true);
    TankAction drive = new TankAction(TankActionName.DRIVE, "Drive", 0, ActionType.DRIVE, null, null, false);
}
