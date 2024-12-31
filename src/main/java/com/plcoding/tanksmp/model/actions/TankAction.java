package com.plcoding.tanksmp.model.actions;

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
    private int rounds;
    private int[] explosionColor;
    private Boolean limitedUse;
}
