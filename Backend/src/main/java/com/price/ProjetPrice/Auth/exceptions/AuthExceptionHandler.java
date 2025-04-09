package com.price.ProjetPrice.Auth.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import com.price.ProjetPrice.Shared.DTO.ApiResponse;
import com.price.ProjetPrice.Shared.Enum.ApiStatus;

@ControllerAdvice
public class AuthExceptionHandler {

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Object>> handleUserAlreadyExistsException(UserAlreadyExistsException ex) {
        ApiResponse<Object> apiResponse = new ApiResponse<>(ex.getMessage(), ApiStatus.FAILURE, null, null);
        return new ResponseEntity<>(apiResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ExpiredTokenException.class)
    public ResponseEntity<ApiResponse<Object>> handleExpiredToken(ExpiredTokenException ex, WebRequest request) {
        ApiResponse<Object> apiResponse = new ApiResponse<>(ex.getMessage(), ApiStatus.FAILURE, null, null);
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST); // 400 Bad Request
    }

    @ExceptionHandler(InvalidRoleException.class)
    public ResponseEntity<ApiResponse<Object>> handleInvalidRoleException(InvalidRoleException ex, WebRequest request) {
        ApiResponse<Object> apiResponse = new ApiResponse<>(ex.getMessage(), ApiStatus.FAILURE, null, null);
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST); // 400 Bad Request
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleUserNotFoundException(UserNotFoundException ex,
            WebRequest request) {
        ApiResponse<Object> apiResponse = new ApiResponse<>(ex.getMessage(), ApiStatus.FAILURE, null, null);
        return new ResponseEntity<>(apiResponse, HttpStatus.NOT_FOUND); // 404 Not Found
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ApiResponse<Object>> handleInvalidTokenException(InvalidTokenException ex,
            WebRequest request) {
        ApiResponse<Object> apiResponse = new ApiResponse<>(ex.getMessage(), ApiStatus.FAILURE, null, null);
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST); // 400 Bad Request
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleInvalidCredentials(InvalidCredentialsException ex,
            WebRequest request) {
        ApiResponse<Object> apiResponse = new ApiResponse<>(ex.getMessage(), ApiStatus.FAILURE, null, null);
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST); // 400 Bad Request
    }
}
