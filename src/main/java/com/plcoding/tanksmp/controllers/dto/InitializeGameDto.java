package com.plcoding.tanksmp.controllers.dto;

import lombok.Data;

@Data
public class InitializeGameDto {
    private String playerName;
    private Float[] requestedColor;
}
