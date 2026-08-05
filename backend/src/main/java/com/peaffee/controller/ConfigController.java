package com.peaffee.controller;

import com.peaffee.config.PaypalProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    private final PaypalProperties paypal;

    @org.springframework.beans.factory.annotation.Value("${google.client-id:${GOOGLE_CLIENT_ID:}}")
    private String googleClientId;

    public ConfigController(PaypalProperties paypal) {
        this.paypal = paypal;
    }

    @GetMapping
    public Map<String, Object> config() {
        boolean configured = paypal.clientId() != null && !paypal.clientId().isBlank();
        Map<String, Object> result = new HashMap<>();
        result.put("paypalClientId", configured ? paypal.clientId() : null);
        result.put("googleClientId", googleClientId != null && !googleClientId.isBlank() ? googleClientId : null);
        result.put("currency", "USD");
        return result;
    }
}
