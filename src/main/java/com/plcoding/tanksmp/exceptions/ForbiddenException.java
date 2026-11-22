package com.plcoding.tanksmp.exceptions;

/** The caller is not allowed to perform the action (missing or wrong player token, not the host). */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
