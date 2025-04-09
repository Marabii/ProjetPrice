package com.price.ProjetPrice.Auth.service;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.price.ProjetPrice.Auth.DTO.AuthenticationRequest;
import com.price.ProjetPrice.Auth.DTO.AuthenticationResponse;
import com.price.ProjetPrice.Auth.DTO.RegisterRequest;
import com.price.ProjetPrice.Auth.exceptions.InvalidCredentialsException;
import com.price.ProjetPrice.Auth.exceptions.UserAlreadyExistsException;
import com.price.ProjetPrice.Auth.exceptions.UserNotFoundException;
import com.price.ProjetPrice.Auth.models.Users;
import com.price.ProjetPrice.Auth.repository.UsersRepository;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UsersRepository repository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${back_end}")
    private String backEnd;

    public AuthenticationResponse register(RegisterRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();
        String name = request.getName();

        // Check if the user already exists
        if (repository.findByEmail(email).isPresent()) {
            throw new UserAlreadyExistsException("You already have an account");
        }

        // Encode the password using PasswordEncoder
        String encodedPassword = passwordEncoder.encode(password);

        // Create and save a new user, including the bank currency
        Users newUser = Users.builder().email(email).password(encodedPassword).name(name)
                .createdAt(new Date())
                .updatedAt(new Date()).build();

        String profilePicture = backEnd + "/images/defaultProfilePicture.png";
        newUser.setProfilePicture(profilePicture);

        repository.save(newUser);

        // Generate and return the JWT token
        String jwtToken = jwtService.generateToken(newUser);
        return AuthenticationResponse.builder().token(jwtToken).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();

        // Find the user by Email
        Users user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found with Email: " + email));

        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // Generate JWT token
        String jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder().token(jwtToken).build();
    }

}
