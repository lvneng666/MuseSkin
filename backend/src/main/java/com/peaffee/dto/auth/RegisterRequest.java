package com.peaffee.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email(message = "Valid email required") @NotBlank String email,
        @NotBlank String password,
        @NotBlank @Size(max = 120) String fullName,
        @Size(max = 50, message = "Username must be 50 characters or fewer") String username
) {}
