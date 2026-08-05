package com.peaffee.controller;

import com.peaffee.dto.ProductResponse;
import com.peaffee.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public Map<String, List<ProductResponse>> list(@RequestParam(required = false) String category) {
        return Map.of("products", productService.list(category));
    }

    @GetMapping("/{slug}")
    public Map<String, ProductResponse> get(@PathVariable String slug) {
        return Map.of("product", productService.getBySlug(slug));
    }
}
