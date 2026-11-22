package com.plcoding.tanksmp.engine;

import java.util.List;

/**
 * @param damagePerTank shield damage taken by each tank, indexed like the tank list
 * @param struckTankIndexes every tank caught in the explosion (directly or by splash), for hit effects
 */
public record ExplosionDamage(int[] damagePerTank, List<Integer> struckTankIndexes) {
}
