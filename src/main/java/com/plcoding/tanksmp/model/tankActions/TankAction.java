package com.plcoding.tanksmp.model.tankActions;

import com.plcoding.tanksmp.model.keywords.ActionType;
import com.plcoding.tanksmp.model.keywords.TankActionName;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TankAction {
    private TankActionName name;
    private String displayName;
    private  int damage;
    private ActionType type;
    private Integer rounds;
    private int[] explosionColor;
    private Boolean limitedUse;

    /** Independent copy, including the explosion color array. */
    public TankAction copy() {
        return new TankAction(name, displayName, damage, type, rounds,
                explosionColor == null ? null : explosionColor.clone(), limitedUse);
    }
}
