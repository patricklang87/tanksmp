package com.plcoding.tanksmp.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class InvalidParamExceptionHandler {

    @ExceptionHandler(value = { InvaildParamException.class })
    public ResponseEntity<Object> handleInvalidParamException(InvaildParamException invalidParamException) {
  
        return new ResponseEntity<>(invalidParamException, HttpStatus.NOT_FOUND);
    }
}
