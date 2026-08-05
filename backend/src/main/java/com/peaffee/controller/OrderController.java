package com.peaffee.controller;

import com.peaffee.config.PaypalProperties;
import com.peaffee.dto.order.CreateOrderRequest;
import com.peaffee.dto.order.OrderItemResponse;
import com.peaffee.dto.order.OrderResponse;
import com.peaffee.entity.Order;
import com.peaffee.exception.ApiException;
import com.peaffee.repository.OrderItemRepository;
import com.peaffee.repository.OrderRepository;
import com.peaffee.security.CurrentUser;
import com.peaffee.service.OrderService;
import com.peaffee.service.PaymentService;
import com.peaffee.service.StorageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentService paymentService;
    private final StorageService storageService;
    private final PaypalProperties paypal;

    public OrderController(OrderService orderService, OrderRepository orderRepository,
                           OrderItemRepository orderItemRepository, PaymentService paymentService,
                           StorageService storageService, PaypalProperties paypal) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentService = paymentService;
        this.storageService = storageService;
        this.paypal = paypal;
    }

    /** Create an order (guest or logged-in). */
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody CreateOrderRequest req) {
        Order order = orderService.createOrder(req, CurrentUser.id());
        Map<String, Object> resp = new HashMap<>();
        resp.put("order_no", order.getOrderNo());
        resp.put("id", order.getId());
        resp.put("customer_email", order.getCustomerEmail());
        resp.put("payment_method", order.getPaymentMethod().name());
        resp.put("payment_status", order.getPaymentStatus().name());
        resp.put("items_subtotal_cents", order.getItemsSubtotalCents());
        resp.put("shipping_cents", order.getShippingCents());
        resp.put("total_cents", order.getTotalCents());
        if (order.getPaymentMethod() == Order.PaymentMethod.western_union) {
            resp.put("wu_instructions", paymentService.wuInstructions(order.getTotalCents()));
        } else {
            boolean configured = paypal.clientId() != null && !paypal.clientId().isBlank();
            resp.put("paypal_client_id", configured ? paypal.clientId() : null);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    /** Guest order lookup by email + order number. */
    @GetMapping("/lookup")
    public Map<String, Object> lookup(@RequestParam String email, @RequestParam String order_no) {
        return orderDetail(orderService.lookup(email, order_no));
    }

    /** Current user's orders. */
    @GetMapping
    public Map<String, Object> myOrders() {
        Long uid = CurrentUser.id();
        if (uid == null) throw ApiException.unauthorized("Not authenticated");
        List<OrderResponse> orders = orderService.listByUser(uid).stream().map(OrderResponse::from).toList();
        return Map.of("orders", orders);
    }

    /** A logged-in user's own order detail. */
    @GetMapping("/{orderNo}")
    public Map<String, Object> myOrder(@PathVariable String orderNo) {
        Long uid = CurrentUser.id();
        if (uid == null) throw ApiException.unauthorized("Not authenticated");
        return orderDetail(orderService.getOwned(orderNo, uid));
    }

    /** Western Union receipt upload (multipart). */
    @PostMapping("/{orderNo}/wu-receipt")
    public Map<String, Object> wuReceipt(@PathVariable String orderNo,
                                         @RequestParam(value = "email", required = false) String email,
                                         @RequestParam(value = "wu_reference", required = false) String wuReference,
                                         @RequestParam(value = "receipt", required = false) MultipartFile receipt) {
        Order order = orderRepository.findByOrderNo(orderNo.toUpperCase())
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        if (order.getPaymentMethod() != Order.PaymentMethod.western_union) {
            throw ApiException.badRequest("This order is not a Western Union order");
        }
        if (order.getPaymentStatus() == Order.PaymentStatus.paid) {
            throw ApiException.badRequest("Order is already paid");
        }
        if (email != null && !email.isBlank() && !order.getCustomerEmail().equals(email.trim().toLowerCase())) {
            throw ApiException.forbidden("Email does not match this order");
        }
        if (receipt != null) {
            String ct = receipt.getContentType();
            if (ct == null || !(ct.startsWith("image/") || ct.equals("application/pdf"))) {
                throw ApiException.badRequest("Only image or PDF receipts are allowed");
            }
            order.setWuReceiptPath(storageService.saveReceipt(order.getOrderNo(), receipt));
        }
        if (wuReference != null && !wuReference.isBlank()) {
            String ref = wuReference.trim();
            order.setWuReference(ref.substring(0, Math.min(200, ref.length())));
        }
        orderRepository.save(order);
        return Map.of("ok", true, "payment_status", order.getPaymentStatus().name());
    }

    private Map<String, Object> orderDetail(Order order) {
        List<OrderItemResponse> items = orderItemRepository.findByOrderId(order.getId())
                .stream().map(OrderItemResponse::from).toList();
        Map<String, Object> result = new HashMap<>();
        result.put("order", OrderResponse.from(order));
        result.put("items", items);
        return result;
    }
}
