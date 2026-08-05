package com.peaffee.service;

import com.peaffee.config.WuProperties;
import com.peaffee.dto.order.WuInstructionsResponse;
import com.peaffee.entity.Order;
import com.peaffee.entity.OrderItem;
import com.peaffee.exception.ApiException;
import com.peaffee.repository.OrderItemRepository;
import com.peaffee.repository.OrderRepository;
import com.peaffee.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
public class PaymentService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;
    private final WuProperties wu;

    public PaymentService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                          ProductRepository productRepository, EmailService emailService, WuProperties wu) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.emailService = emailService;
        this.wu = wu;
    }

    /**
     * The single payment-confirm path (PayPal capture, PayPal webhook, admin WU mark-paid):
     * locks the order + product rows, decrements stock, marks paid/confirmed, emails after commit.
     * Idempotent: an already-paid order returns early.
     */
    @Transactional
    public Order finalizeOrderPayment(String orderNo, String paypalOrderId, String paypalCaptureId) {
        Order order = orderRepository.findByOrderNoForUpdate(orderNo)
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        if (order.getPaymentStatus() == Order.PaymentStatus.paid) {
            return order;
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        List<Long> productIds = items.stream().map(OrderItem::getProductId).filter(Objects::nonNull).toList();
        if (!productIds.isEmpty()) {
            productRepository.lockByIds(productIds);
            for (OrderItem item : items) {
                if (item.getProductId() != null) {
                    int rows = productRepository.decrementStockIfEnough(item.getProductId(), item.getQuantity());
                    if (rows == 0) {
                        throw ApiException.conflict("Insufficient stock for " + item.getTitleEn());
                    }
                }
            }
        }

        order.setPaymentStatus(Order.PaymentStatus.paid);
        order.setOrderStatus(Order.OrderStatus.confirmed);
        order.setPaidAt(Instant.now());
        if (paypalOrderId != null) order.setPaypalOrderId(paypalOrderId);
        if (paypalCaptureId != null) order.setPaypalCaptureId(paypalCaptureId);
        orderRepository.save(order);

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                emailService.sendPaymentReceivedEmail(order, items);
            }
        });
        return order;
    }

    public WuInstructionsResponse wuInstructions(int totalCents) {
        return new WuInstructionsResponse(
                wu.beneficiary() == null || wu.beneficiary().isBlank() ? "Peaffee" : wu.beneficiary(),
                wu.bank(), wu.account(), wu.swift(), wu.currency(),
                String.format("%.2f", totalCents / 100.0));
    }
}
