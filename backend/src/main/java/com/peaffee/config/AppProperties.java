package com.peaffee.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String baseUrl,
        String uploadDir,
        String adminNotifyEmail,
        Admin admin,
        Shipping shipping
) {
    public record Admin(String email, String password, String name) {}
    public record Shipping(int flatCents, int freeThresholdCents) {}
}
