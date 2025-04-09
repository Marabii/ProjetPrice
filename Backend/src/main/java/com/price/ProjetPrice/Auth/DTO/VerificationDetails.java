package com.price.ProjetPrice.Auth.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VerificationDetails {
    private boolean isEmailVerified = false;
    private boolean isPhoneNumberVerified = false;
}
