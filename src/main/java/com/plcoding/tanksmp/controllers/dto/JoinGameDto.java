package com.plcoding.tanksmp.controllers.dto;

import lombok.Data;

@Data
public class JoinGameDto {
    private String playerName;
    private Float[] requestedColor;
    private String gameId;
}
