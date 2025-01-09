package com.plcoding.tanksmp.controllers.dto;

import lombok.Data;

@Data
public class JoinGameDto {
    private String playerName;
    private Integer requestedColor;
    private String gameId;
}
