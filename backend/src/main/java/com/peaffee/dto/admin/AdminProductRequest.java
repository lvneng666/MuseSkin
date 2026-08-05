package com.peaffee.dto.admin;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record AdminProductRequest(
        @NotBlank @Pattern(regexp = "^[a-z0-9-]+$", message = "slug must be lowercase letters, numbers, dashes") String slug,
        @NotBlank String titleEn, @NotBlank String titleCn,
        @NotBlank String category, @NotBlank String categoryEn, @NotBlank String categoryCn,
        @NotBlank String descEn, @NotBlank String descCn,
        String gridDescEn, String gridDescCn,
        @NotBlank String tagEn, @NotBlank String tagCn,
        @NotBlank String activeEn, @NotBlank String activeCn,
        @NotBlank String skinEn, @NotBlank String skinCn,
        @NotBlank String usageEn, @NotBlank String usageCn,
        String moqEn, String moqCn, String ritualCategories,
        String ritualDescEn, String ritualDescCn, String ritualTagEn, String ritualTagCn,
        @NotNull @Min(0) Integer priceCents,
        @NotNull @Min(0) Integer stock,
        @NotBlank String imageUrl,
        String status,
        Boolean featured,
        Integer sortOrder
) {}
