package com.price.ProjetPrice.Auth.models;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.price.ProjetPrice.Auth.DTO.Contact;
import com.price.ProjetPrice.Auth.DTO.VerificationDetails;
import com.price.ProjetPrice.Auth.enums.USER_STATUS;

import java.util.Collection;
import java.util.Date;
import java.util.List;

@Builder
@Document(collection = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Users implements UserDetails {
    @Id
    private String _id;

    private VerificationDetails verificationDetails;
    private Date createdAt;
    private Date updatedAt;
    private String password;
    private String profilePicture;
    private List<Contact> contacts;
    private String role;

    @NotBlank(message = "Name cannot be empty")
    @Size(min = 2, max = 100, message = "name must be between 2 and 100 characters")
    private String name;

    @NotBlank
    @Email(message = "Email must be valid")
    private String email;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private USER_STATUS userStatus = USER_STATUS.OFFLINE;

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("STUDENT"));
    }
}
