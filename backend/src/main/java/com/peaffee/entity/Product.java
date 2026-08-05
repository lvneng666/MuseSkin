package com.peaffee.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_products_status_sort", columnList = "status, sort_order"),
        @Index(name = "idx_products_category", columnList = "category")
})
@Getter
@Setter
public class Product {

    public enum Category { face, body, protection }
    public enum ProductStatus { active, inactive }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "title_en", nullable = false)
    private String titleEn;

    @Column(name = "title_cn", nullable = false)
    private String titleCn;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private Category category;

    @Column(name = "category_en", nullable = false)
    private String categoryEn;

    @Column(name = "category_cn", nullable = false)
    private String categoryCn;

    @Column(name = "desc_en", nullable = false)
    private String descEn;

    @Column(name = "desc_cn", nullable = false)
    private String descCn;

    @Column(name = "grid_desc_en")
    private String gridDescEn;

    @Column(name = "grid_desc_cn")
    private String gridDescCn;

    @Column(name = "tag_en", nullable = false)
    private String tagEn;

    @Column(name = "tag_cn", nullable = false)
    private String tagCn;

    @Column(name = "active_en", nullable = false)
    private String activeEn;

    @Column(name = "active_cn", nullable = false)
    private String activeCn;

    @Column(name = "skin_en", nullable = false)
    private String skinEn;

    @Column(name = "skin_cn", nullable = false)
    private String skinCn;

    @Column(name = "usage_en", nullable = false)
    private String usageEn;

    @Column(name = "usage_cn", nullable = false)
    private String usageCn;

    @Column(name = "moq_en", nullable = false)
    private String moqEn = "Daily ritual";

    @Column(name = "moq_cn", nullable = false)
    private String moqCn = "日常护理";

    @Column(name = "ritual_categories", nullable = false)
    private String ritualCategories = "";

    @Column(name = "ritual_desc_en", nullable = false)
    private String ritualDescEn = "";

    @Column(name = "ritual_desc_cn", nullable = false)
    private String ritualDescCn = "";

    @Column(name = "ritual_tag_en", nullable = false)
    private String ritualTagEn = "";

    @Column(name = "ritual_tag_cn", nullable = false)
    private String ritualTagCn = "";

    @Column(name = "price_cents", nullable = false)
    private int priceCents;

    @Column(name = "stock", nullable = false)
    private int stock;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProductStatus status = ProductStatus.active;

    @Column(name = "featured", nullable = false)
    private boolean featured;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
