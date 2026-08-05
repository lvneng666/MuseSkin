package com.peaffee.dto.auth;

import jakarta.validation.constraints.NotBlank;

/** Login by username OR email. */
public record LoginRequest(
        @NotBlank String identifier,
        @NotBlank String password
) {}
