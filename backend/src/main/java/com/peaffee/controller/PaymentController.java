package com.peaffee.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.peaffee.config.PaypalProperties;
import com.peaffee.config.WuProperties;
import com.peaffee.dto.payment.CaptureRequest;
import com.peaffee.entity.Order;
import com.peaffee.exception.ApiException;
import com.peaffee.repository.OrderRepository;
import com.peaffee.service.PaymentService;
import com.peaffee.service.PaypalService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaypalService paypalService;
    private final PaymentService paymentService;
    private final OrderRepository orderRepository;
    private final PaypalProperties paypal;
    private final WuProperties wu;
    private final ObjectMapper objectMapper;

    public PaymentController(PaypalService paypalService, PaymentService paymentService,
                             OrderRepository orderRepository, PaypalProperties paypal,
                             WuProperties wu, ObjectMapper objectMapper) {
        this.paypalService = paypalService;
        this.paymentService = paymentService;
        this.orderRepository = orderRepository;
        this.paypal = paypal;
        this.wu = wu;
        this.objectMapper = objectMapper;
    }

    public record CreateOrderReq(@NotNull Long orderId) {}

    @PostMapping("/paypal/create-order")
    public Map<String, Object> createPayPalOrder(@Valid @RequestBody CreateOrderReq req) {
        Order order = orderRepository.findById(req.orderId())
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        if (order.getPaymentStatus() != Order.PaymentStatus.pending) {
            throw ApiException.badRequest("Order is not payable");
        }
        Map<String, Object> created = paypalService.createOrder(order.getOrderNo(), order.getTotalCents(), order.getCurrency());
        order.setPaypalOrderId((String) created.get("id"));
        orderRepository.save(order);
        return Map.of("paypal_order_id", created.get("id"));
    }

    @PostMapping("/paypal/capture")
    public Map<String, Object> capture(@Valid @RequestBody CaptureRequest req) {
        Order order = orderRepository.findByOrderNo(req.orderNo().toUpperCase())
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        if (order.getPaypalOrderId() == null || !order.getPaypalOrderId().equals(req.paypalOrderId())) {
            throw ApiException.badRequest("PayPal order id does not match");
        }

        Map<String, Object> data = paypalService.capture(req.paypalOrderId());
        @SuppressWarnings("unchecked")
        var purchaseUnits = (java.util.List<Map<String, Object>>) data.get("purchase_units");
        Map<String, Object> purchaseUnit = purchaseUnits == null || purchaseUnits.isEmpty() ? Map.of() : purchaseUnits.get(0);
        @SuppressWarnings("unchecked")
        var captures = (java.util.List<Map<String, Object>>) purchaseUnit.get("payments");
        Map<String, Object> captureObj = captures == null || captures.isEmpty() ? Map.of()
                : ((java.util.List<Map<String, Object>>) captures.get(0)).get(0);

        if (!"COMPLETED".equals(data.get("status")) || captureObj == null) {
            throw ApiException.badRequest("Payment was not completed (" + data.get("status") + ")");
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> amount = (Map<String, Object>) captureObj.get("amount");
        double paid = amount == null ? 0 : Double.parseDouble(String.valueOf(amount.get("value")));
        if (Math.round(paid * 100) != order.getTotalCents()) {
            throw ApiException.badRequest("Payment amount does not match order total");
        }

        Order finalized = paymentService.finalizeOrderPayment(
                order.getOrderNo(), order.getPaypalOrderId(), (String) captureObj.get("id"));
        Map<String, Object> resp = new HashMap<>();
        resp.put("ok", true);
        resp.put("order_no", order.getOrderNo());
        resp.put("payment_status", finalized.getPaymentStatus().name());
        resp.put("order_status", finalized.getOrderStatus().name());
        return resp;
    }

    /** PayPal webhook — reads the verbatim request body (signature is over exact bytes). */
    @PostMapping("/paypal/webhook")
    public ResponseEntity<Map<String, Object>> webhook(HttpServletRequest request) throws IOException {
        Map<String, String> headers = new HashMap<>();
        Enumeration<String> names = request.getHeaderNames();
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            headers.put(name.toLowerCase(), request.getHeader(name));
        }
        String rawBody = new String(request.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

        if (paypal.webhookId() == null || paypal.webhookId().isBlank()) {
            return ResponseEntity.ok(Map.of("received", true));
        }
        boolean valid;
        try {
            valid = paypalService.verifyWebhook(headers, rawBody);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("received", true));
        }
        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid webhook signature"));
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> event = objectMapper.readValue(rawBody, Map.class);
            if ("PAYMENT.CAPTURE.COMPLETED".equals(event.get("event_type"))) {
                @SuppressWarnings("unchecked")
                Map<String, Object> resource = (Map<String, Object>) event.get("resource");
                Object customId = resource == null ? null : resource.get("custom_id");
                if (customId instanceof String orderNo && orderNo.startsWith("PF-")) {
                    try {
                        paymentService.finalizeOrderPayment(orderNo, null, resource.get("id") == null ? null : String.valueOf(resource.get("id")));
                    } catch (Exception ignored) {
                        // Idempotent backup — capture endpoint is the source of truth.
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return ResponseEntity.ok(Map.of("received", true));
    }

    @GetMapping("/western-union/instructions")
    public Map<String, Object> wuInstructions() {
        Map<String, Object> result = new HashMap<>();
        result.put("beneficiary", wu.beneficiary());
        result.put("bank", wu.bank());
        result.put("account", wu.account());
        result.put("swift", wu.swift());
        result.put("currency", wu.currency());
        return result;
    }
}
