package com.peaffee.controller.admin;

import com.peaffee.dto.admin.AdminStatsResponse;
import com.peaffee.dto.order.OrderResponse;
import com.peaffee.repository.InquiryRepository;
import com.peaffee.repository.OrderItemRepository;
import com.peaffee.repository.OrderRepository;
import com.peaffee.repository.ProductRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final InquiryRepository inquiryRepository;
    private final ProductRepository productRepository;

    public AdminStatsController(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                                InquiryRepository inquiryRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.inquiryRepository = inquiryRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public AdminStatsResponse stats() {
        Instant startOfDay = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant weekAgo = startOfDay.minus(6, ChronoUnit.DAYS);

        List<AdminStatsResponse.DailyStat> daily = orderRepository.dailyStats(weekAgo).stream()
                .map(r -> new AdminStatsResponse.DailyStat(
                        (String) r[0], ((Number) r[1]).longValue(), ((Number) r[2]).longValue()))
                .toList();

        List<AdminStatsResponse.StatusCount> distribution = orderRepository.statusDistribution().stream()
                .map(r -> new AdminStatsResponse.StatusCount(
                        (String) r[0], ((Number) r[1]).longValue()))
                .toList();

        List<AdminStatsResponse.TopProduct> topProducts = orderItemRepository.topProducts(5).stream()
                .map(r -> new AdminStatsResponse.TopProduct(
                        (String) r[0], (String) r[1], (String) r[2],
                        ((Number) r[3]).longValue(), ((Number) r[4]).longValue()))
                .toList();

        List<OrderResponse> recent = orderRepository.findTop8ByOrderByPlacedAtDesc().stream()
                .map(OrderResponse::from).toList();

        return new AdminStatsResponse(
                orderRepository.count(),
                orderRepository.sumTotalCentsPaid(),
                orderRepository.countPlacedSince(startOfDay),
                orderRepository.countPendingWu(),
                inquiryRepository.countByStatus("new"),
                productRepository.countLowStock(5),
                daily, distribution, topProducts, recent);
    }
}
