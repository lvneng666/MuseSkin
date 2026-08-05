package com.peaffee.dto.order;

import com.peaffee.entity.Order;

import java.time.Instant;

/**
 * Mirrors the Node order row (SELECT *): all scalar order fields.
 * The lazy items collection is excluded; detail responses carry it separately.
 */
public record OrderResponse(
        Long id,
        String orderNo,
        Long userId,
        String customerName,
        String customerEmail,
        String country,
        String shippingAddress,
        String paymentMethod,
        String paymentStatus,
        String orderStatus,
        String paypalOrderId,
        String paypalCaptureId,
        String wuReference,
        String wuReceiptPath,
        int itemsSubtotalCents,
        int shippingCents,
        int totalCents,
        String currency,
        Instant placedAt,
        Instant paidAt,
        Instant shippedAt,
        String adminNotes,
        Instant createdAt,
        Instant updatedAt
) {
    public static OrderResponse from(Order o) {
        return new OrderResponse(
                o.getId(), o.getOrderNo(), o.getUserId(), o.getCustomerName(), o.getCustomerEmail(),
                o.getCountry(), o.getShippingAddress(), o.getPaymentMethod().name(), o.getPaymentStatus().name(),
                o.getOrderStatus().name(), o.getPaypalOrderId(), o.getPaypalCaptureId(), o.getWuReference(),
                o.getWuReceiptPath(), o.getItemsSubtotalCents(), o.getShippingCents(), o.getTotalCents(),
                o.getCurrency(), o.getPlacedAt(), o.getPaidAt(), o.getShippedAt(), o.getAdminNotes(),
                o.getCreatedAt(), o.getUpdatedAt());
    }
}
