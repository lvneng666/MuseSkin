package com.peaffee.dto;

import com.peaffee.entity.Product;

/**
 * Public product (mirrors the Node PRODUCT_FIELDS): no status or timestamps.
 * snake_case field names come from the global Jackson naming strategy.
 */
public record ProductResponse(
        Long id,
        String slug,
        String titleEn,
        String titleCn,
        String category,
        String categoryEn,
        String categoryCn,
        String descEn,
        String descCn,
        String gridDescEn,
        String gridDescCn,
        String tagEn,
        String tagCn,
        String activeEn,
        String activeCn,
        String skinEn,
        String skinCn,
        String usageEn,
        String usageCn,
        String moqEn,
        String moqCn,
        String ritualCategories,
        String ritualDescEn,
        String ritualDescCn,
        String ritualTagEn,
        String ritualTagCn,
        int priceCents,
        int stock,
        String imageUrl,
        boolean featured,
        int sortOrder
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(
                p.getId(), p.getSlug(), p.getTitleEn(), p.getTitleCn(), p.getCategory().name(),
                p.getCategoryEn(), p.getCategoryCn(), p.getDescEn(), p.getDescCn(),
                p.getGridDescEn(), p.getGridDescCn(), p.getTagEn(), p.getTagCn(),
                p.getActiveEn(), p.getActiveCn(), p.getSkinEn(), p.getSkinCn(),
                p.getUsageEn(), p.getUsageCn(), p.getMoqEn(), p.getMoqCn(),
                p.getRitualCategories(), p.getRitualDescEn(), p.getRitualDescCn(),
                p.getRitualTagEn(), p.getRitualTagCn(),
                p.getPriceCents(), p.getStock(), p.getImageUrl(), p.isFeatured(), p.getSortOrder());
    }
}
