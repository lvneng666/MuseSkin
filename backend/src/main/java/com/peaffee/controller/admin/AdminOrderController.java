package com.peaffee.controller.admin;

import com.peaffee.dto.order.OrderItemResponse;
import com.peaffee.dto.order.OrderResponse;
import com.peaffee.entity.Order;
import com.peaffee.exception.ApiException;
import com.peaffee.repository.OrderItemRepository;
import com.peaffee.repository.OrderRepository;
import com.peaffee.service.EmailService;
import com.peaffee.service.PaymentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentService paymentService;
    private final EmailService emailService;

    public AdminOrderController(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                                PaymentService paymentService, EmailService emailService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentService = paymentService;
        this.emailService = emailService;
    }

    public record StatusRequest(Order.OrderStatus orderStatus) {}

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) String order_status,
                                    @RequestParam(required = false) String payment_status,
                                    @RequestParam(required = false) String q) {
        String pattern = (q == null || q.isBlank()) ? null : "%" + q.toLowerCase() + "%";
        List<OrderResponse> orders = orderRepository.search(
                        parseEnum(order_status, Order.OrderStatus.class),
                        parseEnum(payment_status, Order.PaymentStatus.class),
                        pattern)
                .stream().map(OrderResponse::from).toList();
        return Map.of("orders", orders);
    }

    @GetMapping("/{orderNo}")
    public Map<String, Object> detail(@PathVariable String orderNo) {
        Order order = orderRepository.findByOrderNo(orderNo.toUpperCase())
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        return detailMap(order);
    }

    @PatchMapping("/{orderNo}/status")
    public Map<String, Object> patchStatus(@PathVariable String orderNo, @RequestBody StatusRequest req) {
        Order order = orderRepository.findByOrderNo(orderNo.toUpperCase())
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        Order.OrderStatus target = req.orderStatus();
        if (target == null) throw ApiException.badRequest("order_status is required");

        switch (target) {
            case shipped -> {
                if (order.getOrderStatus() != Order.OrderStatus.confirmed) {
                    throw ApiException.badRequest("Can only ship a confirmed order");
                }
                order.setShippedAt(Instant.now());
            }
            case completed -> {
                if (order.getOrderStatus() != Order.OrderStatus.shipped) {
                    throw ApiException.badRequest("Can only complete a shipped order");
                }
            }
            case cancelled -> {
                if (order.getOrderStatus() == Order.OrderStatus.completed
                        || order.getOrderStatus() == Order.OrderStatus.cancelled) {
                    throw ApiException.badRequest("Order is already final");
                }
                if (order.getPaymentStatus() != Order.PaymentStatus.paid) {
                    order.setPaymentStatus(Order.PaymentStatus.cancelled);
                }
            }
            case confirmed -> { /* direct manual confirmation */ }
        }
        order.setOrderStatus(target);
        orderRepository.save(order);
        if (target == Order.OrderStatus.shipped) {
            emailService.sendOrderShippedEmail(order);
        }
        return Map.of("order", OrderResponse.from(order));
    }

    /** Mark a paid order as refunded. */
    @PostMapping("/{orderNo}/refund")
    public Map<String, Object> refund(@PathVariable String orderNo) {
        Order order = orderRepository.findByOrderNo(orderNo.toUpperCase())
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        if (order.getPaymentStatus() != Order.PaymentStatus.paid) {
            throw ApiException.badRequest("Only paid orders can be refunded");
        }
        order.setPaymentStatus(Order.PaymentStatus.refunded);
        orderRepository.save(order);
        return Map.of("order", OrderResponse.from(order));
    }

    /** Manual Western Union confirmation — same finalize path as PayPal. */
    @PostMapping("/{orderNo}/mark-paid")
    public Map<String, Object> markPaid(@PathVariable String orderNo) {
        Order order = orderRepository.findByOrderNo(orderNo.toUpperCase())
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        if (order.getPaymentMethod() != Order.PaymentMethod.western_union) {
            throw ApiException.badRequest("Only Western Union orders can be manually marked paid");
        }
        if (order.getPaymentStatus() == Order.PaymentStatus.paid) {
            Map<String, Object> already = new HashMap<>();
            already.put("order", OrderResponse.from(order));
            already.put("already", true);
            return already;
        }
        Order finalized = paymentService.finalizeOrderPayment(order.getOrderNo(), null, null);
        return Map.of("order", OrderResponse.from(finalized));
    }

    private Map<String, Object> detailMap(Order order) {
        List<OrderItemResponse> items = orderItemRepository.findByOrderId(order.getId())
                .stream().map(OrderItemResponse::from).toList();
        Map<String, Object> result = new HashMap<>();
        result.put("order", OrderResponse.from(order));
        result.put("items", items);
        return result;
    }

    private static <E extends Enum<E>> E parseEnum(String value, Class<E> type) {
        if (value == null || value.isBlank()) return null;
        try {
            return Enum.valueOf(type, value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
