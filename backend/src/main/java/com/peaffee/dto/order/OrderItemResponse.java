package com.peaffee.dto.order;

import com.peaffee.entity.OrderItem;

/** Mirrors the Node order_items row. */
public record OrderItemResponse(
        Long id, String slug, String titleEn, String titleCn,
        int unitPriceCents, int quantity, int lineTotalCents, String imageUrl
) {
    public static OrderItemResponse from(OrderItem i) {
        return new OrderItemResponse(i.getId(), i.getSlug(), i.getTitleEn(), i.getTitleCn(),
                i.getUnitPriceCents(), i.getQuantity(), i.getLineTotalCents(), i.getImageUrl());
    }
}
