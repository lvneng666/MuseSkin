package com.peaffee.controller.admin;

import com.peaffee.dto.admin.AdminStatsResponse;
import com.peaffee.repository.InquiryRepository;
import com.peaffee.repository.OrderRepository;
import com.peaffee.repository.ProductRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

    private final OrderRepository orderRepository;
    private final InquiryRepository inquiryRepository;
    private final ProductRepository productRepository;

    public AdminStatsController(OrderRepository orderRepository, InquiryRepository inquiryRepository,
                                ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.inquiryRepository = inquiryRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public AdminStatsResponse stats() {
        Instant startOfDay = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();
        return new AdminStatsResponse(
                orderRepository.count(),
                orderRepository.sumTotalCentsPaid(),
                orderRepository.countPlacedSince(startOfDay),
                orderRepository.countPendingWu(),
                inquiryRepository.countByStatus("new"),
                productRepository.countLowStock(5));
    }
}
