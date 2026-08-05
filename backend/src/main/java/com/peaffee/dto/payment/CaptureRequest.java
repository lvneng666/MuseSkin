package com.peaffee.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CaptureRequest(
        @NotBlank String orderNo,
        @NotBlank String paypalOrderId
) {}
