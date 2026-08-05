package com.peaffee.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.wu")
public record WuProperties(String beneficiary, String bank, String account, String swift, String currency) {}
