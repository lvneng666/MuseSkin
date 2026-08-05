package com.peaffee.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.paypal")
public record PaypalProperties(String mode, String clientId, String clientSecret, String webhookId) {}
