package com.plcoding.tanksmp.exceptions;

public class InvalidGameStateException extends RuntimeException {

    public InvalidGameStateException(String message) {
        super(message);
    }
}
