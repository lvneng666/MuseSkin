package com.peaffee.service;

import com.peaffee.config.PaypalProperties;
import com.peaffee.exception.ApiException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaypalService {

    private final RestClient restClient;
    private final PaypalProperties props;
    private volatile String token;
    private volatile long tokenExpiresAt;

    public PaypalService(RestClient paypalRestClient, PaypalProperties props) {
        this.restClient = paypalRestClient;
        this.props = props;
    }

    private synchronized String getAccessToken() {
        if (token != null && System.currentTimeMillis() < tokenExpiresAt) {
            return token;
        }
        if (props.clientId() == null || props.clientId().isBlank()) {
            throw ApiException.serviceUnavailable("Online payment is not configured yet");
        }
        String auth = Base64.getEncoder().encodeToString(
                (props.clientId() + ":" + props.clientSecret()).getBytes(StandardCharsets.UTF_8));
        @SuppressWarnings("unchecked")
        Map<String, Object> resp = restClient.post()
                .uri("/v1/oauth2/token")
                .header(HttpHeaders.AUTHORIZATION, "Basic " + auth)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body("grant_type=client_credentials")
                .retrieve()
                .body(Map.class);
        String accessToken = (String) resp.get("access_token");
        int expiresIn = ((Number) resp.get("expires_in")).intValue();
        this.token = accessToken;
        this.tokenExpiresAt = System.currentTimeMillis() + (expiresIn - 60) * 1000L;
        return accessToken;
    }

    /** Create a PayPal order; custom_id carries our order_no for webhook mapping. */
    public Map<String, Object> createOrder(String orderNo, int amountCents, String currency) {
        String value = BigDecimal.valueOf(amountCents).movePointLeft(2).toPlainString();
        Map<String, Object> purchaseUnit = Map.of(
                "reference_id", orderNo,
                "custom_id", orderNo,
                "amount", Map.of("currency_code", currency, "value", value));
        Map<String, Object> body = Map.of("intent", "CAPTURE", "purchase_units", List.of(purchaseUnit));
        return restClient.post()
                .uri("/v2/checkout/orders")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + getAccessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> capture(String paypalOrderId) {
        return restClient.post()
                .uri("/v2/checkout/orders/{id}/capture", paypalOrderId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + getAccessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(Map.class);
    }

    /** Verify a PayPal webhook signature over the verbatim request bytes. */
    public boolean verifyWebhook(Map<String, String> headers, String rawBody) {
        if (props.webhookId() == null || props.webhookId().isBlank()) {
            return false;
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("auth_algo", headers.get("paypal-auth-algo"));
        payload.put("cert_url", headers.get("paypal-cert-url"));
        payload.put("transmission_id", headers.get("paypal-transmission-id"));
        payload.put("transmission_sig", headers.get("paypal-transmission-sig"));
        payload.put("transmission_time", headers.get("paypal-transmission-time"));
        payload.put("webhook_id", props.webhookId());
        payload.put("webhook_event", rawBody);

        Map<String, Object> resp = restClient.post()
                .uri("/v1/notifications/verify-webhook-signature")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + getAccessToken())
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
        return "SUCCESS".equals(resp.get("verification_status"));
    }
}
