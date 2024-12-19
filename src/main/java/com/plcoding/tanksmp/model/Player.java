package com.plcoding.tanksmp.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Player {
    String name;
    Tank tank;
    Integer playerGameId;
    Integer wins;

}
