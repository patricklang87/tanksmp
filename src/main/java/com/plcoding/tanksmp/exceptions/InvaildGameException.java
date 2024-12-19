package com.plcoding.tanksmp.exceptions;

public class InvaildGameException extends Exception {
    private String message;

    public InvaildGameException(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

}
