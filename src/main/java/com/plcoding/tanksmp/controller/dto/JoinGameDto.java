package com.plcoding.tanksmp.controller.dto;

import lombok.Data;

@Data
public class JoinGameDto {
    private String playerName;
    private Float[] requestedColor;
    private String gameId;
}
