package com.peaffee.dto.order;

import com.peaffee.entity.Order;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateOrderRequest(
        @NotNull Order.PaymentMethod paymentMethod,
        @Valid @NotNull CustomerRequest customer,
        @Valid @Size(min = 1, max = 50) List<OrderItemRequest> items
) {
    public record CustomerRequest(
            @NotBlank @Size(max = 120) String name,
            @NotBlank @jakarta.validation.constraints.Email String email,
            @NotBlank @Size(max = 120) String country,
            @NotBlank @Size(max = 500) String address
    ) {}
}
