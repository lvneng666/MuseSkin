package com.peaffee.service;

import com.peaffee.dto.ProductResponse;
import com.peaffee.entity.Product;
import com.peaffee.exception.ApiException;
import com.peaffee.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> list(String category) {
        if (category == null || category.isBlank() || "all".equalsIgnoreCase(category)) {
            return productRepository.findByStatusOrderBySortOrderAscTitleEnAsc(Product.ProductStatus.active)
                    .stream().map(ProductResponse::from).toList();
        }
        Product.Category cat;
        try {
            cat = Product.Category.valueOf(category);
        } catch (IllegalArgumentException e) {
            return List.of();
        }
        return productRepository.findByStatusAndCategoryOrderBySortOrderAscTitleEnAsc(Product.ProductStatus.active, cat)
                .stream().map(ProductResponse::from).toList();
    }

    public ProductResponse getBySlug(String slug) {
        Product product = productRepository.findBySlugAndStatus(slug, Product.ProductStatus.active)
                .orElseThrow(() -> ApiException.notFound("Product not found"));
        return ProductResponse.from(product);
    }
}
