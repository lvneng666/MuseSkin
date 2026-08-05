package com.peaffee.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.peaffee.config.AppProperties;
import com.peaffee.entity.Product;
import com.peaffee.entity.User;
import com.peaffee.repository.ProductRepository;
import com.peaffee.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;

/**
 * Idempotent seed: 12 catalog products (from seed-products.json) + the admin
 * user from env (BCrypt hash must be computed at runtime). Runs after Flyway.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties app;
    private final ObjectMapper objectMapper;

    public DataSeeder(ProductRepository productRepository, UserRepository userRepository,
                      PasswordEncoder passwordEncoder, AppProperties app, ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.app = app;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(String... args) throws IOException {
        seedProducts();
        seedAdmin();
        backfillUsernames();
    }

    /** Give pre-existing users (no username) one derived from their email local part. */
    private void backfillUsernames() {
        for (User u : userRepository.findAll()) {
            if (u.getUsername() == null || u.getUsername().isBlank()) {
                String base = u.getEmail().split("@")[0].replaceAll("[^a-zA-Z0-9_.-]", "");
                if (base.isEmpty()) base = "user";
                String candidate = base;
                int suffix = 1;
                while (userRepository.findByUsername(candidate).isPresent()) {
                    candidate = base + suffix++;
                }
                u.setUsername(candidate);
                userRepository.save(u);
            }
        }
    }

    private void seedProducts() throws IOException {
        ProductDraft[] drafts;
        try (InputStream in = getClass().getResourceAsStream("/seed-products.json")) {
            if (in == null) {
                log.warn("seed-products.json not found — skipping product seed");
                return;
            }
            drafts = objectMapper.readValue(in, ProductDraft[].class);
        }
        for (ProductDraft d : drafts) {
            Product product = productRepository.findBySlug(d.slug()).orElseGet(Product::new);
            apply(product, d);
            productRepository.save(product);
        }
        log.info("Seeded {} products", drafts.length);
    }

    private void seedAdmin() {
        String email = app.admin().email();
        String password = app.admin().password();
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            log.info("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed");
            return;
        }
        email = email.trim().toLowerCase();
        if (userRepository.findByEmail(email).isEmpty()) {
            User admin = new User();
            admin.setEmail(email);
            admin.setUsername(email.split("@")[0]);
            admin.setPasswordHash(passwordEncoder.encode(password));
            admin.setFullName(app.admin().name());
            admin.setRole(User.Role.admin);
            userRepository.save(admin);
            log.info("Seeded admin {} (username {})", email, email.split("@")[0]);
        }
    }

    private void apply(Product p, ProductDraft d) {
        p.setSlug(d.slug());
        p.setTitleEn(d.titleEn());
        p.setTitleCn(d.titleCn());
        p.setCategory(Product.Category.valueOf(d.category()));
        p.setCategoryEn(d.categoryEn());
        p.setCategoryCn(d.categoryCn());
        p.setDescEn(d.descEn());
        p.setDescCn(d.descCn());
        p.setGridDescEn(d.gridDescEn());
        p.setGridDescCn(d.gridDescCn());
        p.setTagEn(d.tagEn());
        p.setTagCn(d.tagCn());
        p.setActiveEn(d.activeEn());
        p.setActiveCn(d.activeCn());
        p.setSkinEn(d.skinEn());
        p.setSkinCn(d.skinCn());
        p.setUsageEn(d.usageEn());
        p.setUsageCn(d.usageCn());
        p.setMoqEn(d.moqEn());
        p.setMoqCn(d.moqCn());
        p.setRitualCategories(d.ritualCategories());
        p.setRitualDescEn(d.ritualDescEn());
        p.setRitualDescCn(d.ritualDescCn());
        p.setRitualTagEn(d.ritualTagEn());
        p.setRitualTagCn(d.ritualTagCn());
        p.setPriceCents(d.priceCents());
        p.setStock(d.stock());
        p.setImageUrl(d.imageUrl());
        p.setStatus(Product.ProductStatus.valueOf(d.status()));
        p.setFeatured(d.featured());
        p.setSortOrder(d.sortOrder());
    }

    /** Field names are camelCase; the global Jackson SNAKE_CASE strategy maps seed-products.json keys. */
    record ProductDraft(
            String slug, String titleEn, String titleCn, String category, String categoryEn, String categoryCn,
            String descEn, String descCn, String gridDescEn, String gridDescCn, String tagEn, String tagCn,
            String activeEn, String activeCn, String skinEn, String skinCn, String usageEn, String usageCn,
            String moqEn, String moqCn, String ritualCategories, String ritualDescEn, String ritualDescCn,
            String ritualTagEn, String ritualTagCn, int priceCents, int stock, String imageUrl,
            String status, boolean featured, int sortOrder) {}
}
