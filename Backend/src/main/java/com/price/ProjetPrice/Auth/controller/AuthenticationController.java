package com.price.ProjetPrice.Auth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.price.ProjetPrice.Auth.DTO.AuthenticationRequest;
import com.price.ProjetPrice.Auth.DTO.AuthenticationResponse;
import com.price.ProjetPrice.Auth.DTO.RegisterRequest;
import com.price.ProjetPrice.Auth.service.AuthenticationService;
import com.price.ProjetPrice.Shared.DTO.ApiResponse;
import com.price.ProjetPrice.Shared.Enum.ApiStatus;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> register(@RequestBody @Valid RegisterRequest request) {

        // Perform the registration
        AuthenticationResponse jwtInstance = service.register(request);

        // Create standardized API response
        ApiResponse<AuthenticationResponse> apiResponse = new ApiResponse<>(
                "User registered successfully",
                ApiStatus.SUCCESS,
                null, // No errors
                jwtInstance);

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> authenticate(
            @RequestBody @Valid AuthenticationRequest request) {
        // Perform the authentication
        AuthenticationResponse jwtInstance = service.authenticate(request);

        // Create standardized API response
        ApiResponse<AuthenticationResponse> apiResponse = new ApiResponse<>(
                "User logged in successfully",
                ApiStatus.SUCCESS,
                null, // No errors
                jwtInstance);

        return ResponseEntity.ok(apiResponse);
    }

}
