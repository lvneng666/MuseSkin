package com.peaffee.service;

import com.peaffee.config.AppProperties;
import com.peaffee.dto.order.CreateOrderRequest;
import com.peaffee.dto.order.OrderItemRequest;
import com.peaffee.entity.Order;
import com.peaffee.entity.OrderItem;
import com.peaffee.entity.Product;
import com.peaffee.exception.ApiException;
import com.peaffee.repository.OrderRepository;
import com.peaffee.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private static final String CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;
    private final AppProperties app;
    private final SecureRandom random = new SecureRandom();

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository,
                        EmailService emailService, AppProperties app) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.emailService = emailService;
        this.app = app;
    }

    /** Create an order + items in one transaction. Stock is validated but only decremented on payment. */
    @Transactional
    public Order createOrder(CreateOrderRequest req, Long userId) {
        int subtotal = 0;
        List<OrderItem> items = new ArrayList<>();
        for (OrderItemRequest itemReq : req.items()) {
            Product product = productRepository.findBySlugAndStatus(itemReq.slug(), Product.ProductStatus.active)
                    .orElseThrow(() -> ApiException.badRequest("Unknown or unavailable product: " + itemReq.slug()));
            if (product.getStock() < itemReq.quantity()) {
                throw ApiException.conflict("Not enough stock for " + product.getTitleEn());
            }
            int lineTotal = product.getPriceCents() * itemReq.quantity();
            subtotal += lineTotal;

            OrderItem item = new OrderItem();
            item.setSlug(product.getSlug());
            item.setTitleEn(product.getTitleEn());
            item.setTitleCn(product.getTitleCn());
            item.setUnitPriceCents(product.getPriceCents());
            item.setQuantity(itemReq.quantity());
            item.setLineTotalCents(lineTotal);
            item.setImageUrl(product.getImageUrl());
            item.setProductId(product.getId());
            items.add(item);
        }

        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUserId(userId);
        order.setCustomerName(req.customer().name());
        order.setCustomerEmail(req.customer().email().trim().toLowerCase());
        order.setCountry(req.customer().country());
        order.setShippingAddress(req.customer().address());
        order.setPaymentMethod(req.paymentMethod());
        order.setPaymentStatus(req.paymentMethod() == Order.PaymentMethod.western_union
                ? Order.PaymentStatus.awaiting_confirmation : Order.PaymentStatus.pending);
        order.setItemsSubtotalCents(subtotal);
        order.setShippingCents(computeShipping(subtotal));
        order.setTotalCents(subtotal + order.getShippingCents());
        for (OrderItem item : items) {
            item.setOrder(order);
            order.getItems().add(item);
        }
        orderRepository.save(order);

        // Fire-and-forget async email (order fields are set in memory; no DB read needed).
        emailService.sendOrderConfirmationEmail(order, items);
        return order;
    }

    public Order lookup(String email, String orderNo) {
        return orderRepository.findByCustomerEmailAndOrderNo(email.trim().toLowerCase(), orderNo.trim().toUpperCase())
                .orElseThrow(() -> ApiException.notFound("Order not found"));
    }

    public List<Order> listByUser(Long userId) {
        return orderRepository.findByUserIdOrderByPlacedAtDesc(userId);
    }

    public Order getOwned(String orderNo, Long userId) {
        return orderRepository.findByOrderNoAndUserId(orderNo.trim().toUpperCase(), userId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));
    }

    /** Configurable flat shipping, waived at/above the free-shipping threshold (0 = free). */
    private int computeShipping(int subtotalCents) {
        int flat = app.shipping() == null ? 0 : app.shipping().flatCents();
        int threshold = app.shipping() == null ? 0 : app.shipping().freeThresholdCents();
        if (threshold > 0 && subtotalCents >= threshold) {
            return 0;
        }
        return Math.max(0, flat);
    }

    /** Human-facing order number: PF-<base36 millis>-<4 random base36>. */
    String generateOrderNo() {
        String ts = Long.toString(System.currentTimeMillis(), 36).toUpperCase();
        StringBuilder rand = new StringBuilder();
        for (int i = 0; i < 4; i++) {
            rand.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return "PF-" + ts + "-" + rand;
    }
}
