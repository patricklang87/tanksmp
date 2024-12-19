package com.plcoding.tanksmp.controller.dto;

import lombok.Data;

@Data
public class InitializeGameDto {
    private String playerName;
    private Float[] requestedColor;
}
