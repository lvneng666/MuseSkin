package com.peaffee.controller.admin;

import com.peaffee.dto.admin.AdminProductRequest;
import com.peaffee.entity.Product;
import com.peaffee.exception.ApiException;
import com.peaffee.repository.ProductRepository;
import com.peaffee.service.StorageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final ProductRepository productRepository;
    private final StorageService storageService;

    public AdminProductController(ProductRepository productRepository, StorageService storageService) {
        this.productRepository = productRepository;
        this.storageService = storageService;
    }

    /** Upload a product image; returns the web path to paste into image_url. */
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadImage(@RequestParam("image") MultipartFile image) {
        return Map.of("url", storageService.saveProductImage(image));
    }

    @GetMapping
    public Map<String, List<Product>> list() {
        return Map.of("products", productRepository.findAll(Sort.by(Sort.Direction.ASC, "sortOrder")));
    }

    @PostMapping
    public ResponseEntity<Map<String, Product>> create(@Valid @RequestBody AdminProductRequest req) {
        Product product = apply(new Product(), req);
        productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("product", product));
    }

    @PutMapping("/{id}")
    public Map<String, Product> update(@PathVariable Long id, @Valid @RequestBody AdminProductRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Product not found"));
        apply(product, req);
        productRepository.save(product);
        return Map.of("product", product);
    }

    /** Soft-delete: flip to inactive so historical orders keep their snapshots. */
    @DeleteMapping("/{id}")
    public Map<String, Boolean> deactivate(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Product not found"));
        product.setStatus(Product.ProductStatus.inactive);
        productRepository.save(product);
        return Map.of("ok", true);
    }

    private Product apply(Product p, AdminProductRequest req) {
        p.setSlug(req.slug());
        p.setTitleEn(req.titleEn());
        p.setTitleCn(req.titleCn());
        p.setCategory(Product.Category.valueOf(req.category()));
        p.setCategoryEn(req.categoryEn());
        p.setCategoryCn(req.categoryCn());
        p.setDescEn(req.descEn());
        p.setDescCn(req.descCn());
        p.setGridDescEn(req.gridDescEn());
        p.setGridDescCn(req.gridDescCn());
        p.setTagEn(req.tagEn());
        p.setTagCn(req.tagCn());
        p.setActiveEn(req.activeEn());
        p.setActiveCn(req.activeCn());
        p.setSkinEn(req.skinEn());
        p.setSkinCn(req.skinCn());
        p.setUsageEn(req.usageEn());
        p.setUsageCn(req.usageCn());
        p.setMoqEn(req.moqEn() == null || req.moqEn().isBlank() ? "Daily ritual" : req.moqEn());
        p.setMoqCn(req.moqCn() == null || req.moqCn().isBlank() ? "日常护理" : req.moqCn());
        p.setRitualCategories(req.ritualCategories() == null ? "" : req.ritualCategories());
        p.setRitualDescEn(req.ritualDescEn() == null ? "" : req.ritualDescEn());
        p.setRitualDescCn(req.ritualDescCn() == null ? "" : req.ritualDescCn());
        p.setRitualTagEn(req.ritualTagEn() == null ? "" : req.ritualTagEn());
        p.setRitualTagCn(req.ritualTagCn() == null ? "" : req.ritualTagCn());
        p.setPriceCents(req.priceCents());
        p.setStock(req.stock());
        p.setImageUrl(req.imageUrl());
        p.setStatus(req.status() == null || req.status().isBlank()
                ? Product.ProductStatus.active : Product.ProductStatus.valueOf(req.status()));
        p.setFeatured(req.featured() != null && req.featured());
        p.setSortOrder(req.sortOrder() == null ? 0 : req.sortOrder());
        return p;
    }
}
