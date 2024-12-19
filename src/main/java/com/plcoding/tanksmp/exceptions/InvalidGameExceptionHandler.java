package com.plcoding.tanksmp.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class InvalidGameExceptionHandler {

    @ExceptionHandler(value = { InvaildGameException.class })
    public ResponseEntity<Object> handleInvalidGameException(InvaildGameException invalidGameException) {
  
        return new ResponseEntity<>(invalidGameException, HttpStatus.BAD_REQUEST);
    }
}
