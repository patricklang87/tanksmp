package com.plcoding.tanksmp.model;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.ToString;

@Data
@AllArgsConstructor
public class Player {
    private String name;
    private Tank tank;
    /** Position of this player in the match's player list; also the index of their tank. */
    private Integer playerIndex;
    private Integer wins;
    /**
     * Secret that authorizes this player's commands. Handed out once, in the join response, and
     * never serialized anywhere else.
     */
    @JsonIgnore
    @ToString.Exclude
    private UUID playerToken;

    /** Deep copy for publishing: the secret token is deliberately left out. */
    public Player snapshot() {
        return new Player(name, tank.snapshot(), playerIndex, wins, null);
    }
}
