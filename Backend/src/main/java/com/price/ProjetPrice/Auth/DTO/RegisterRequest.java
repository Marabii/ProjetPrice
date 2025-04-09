package com.price.ProjetPrice.Auth.DTO;

import lombok.Builder;
import lombok.Data;

import jakarta.validation.constraints.*;

@Data
@Builder
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$", message = "Password must be at least 8 characters long, and include one uppercase letter, one lowercase letter, and one digit.")
    private String password;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    @Pattern(regexp = "^[\\p{L} ]+$", message = "Name can only contain letters and spaces")
    private String name;
}
