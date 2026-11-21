package com.plcoding.tanksmp.exceptions;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Translates domain exceptions into HTTP responses with a JSON body of the
 * form {"message": "..."}.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(GameNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleGameNotFound(GameNotFoundException exception) {
        return buildResponse(HttpStatus.NOT_FOUND, exception);
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<Map<String, String>> handleInvalidRequest(InvalidRequestException exception) {
        return buildResponse(HttpStatus.BAD_REQUEST, exception);
    }

    @ExceptionHandler(InvalidGameStateException.class)
    public ResponseEntity<Map<String, String>> handleInvalidGameState(InvalidGameStateException exception) {
        return buildResponse(HttpStatus.CONFLICT, exception);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleUnreadableBody(HttpMessageNotReadableException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "The request body is missing or malformed."));
    }

    private ResponseEntity<Map<String, String>> buildResponse(HttpStatus status, RuntimeException exception) {
        return ResponseEntity.status(status).body(Map.of("message", exception.getMessage()));
    }
}
