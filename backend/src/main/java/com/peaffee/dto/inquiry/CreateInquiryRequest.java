package com.peaffee.dto.inquiry;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateInquiryRequest(
        @NotBlank @Size(max = 120) String name,
        @Email @NotBlank String email,
        @Size(max = 200) String interest,
        @NotBlank @Size(max = 5000) String message
) {}
