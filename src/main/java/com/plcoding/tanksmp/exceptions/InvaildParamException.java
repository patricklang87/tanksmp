package com.plcoding.tanksmp.exceptions;

public class InvaildParamException extends Exception {
    private String message;

    public InvaildParamException(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

}
