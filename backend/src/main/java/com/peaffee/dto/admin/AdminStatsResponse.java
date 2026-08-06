package com.peaffee.dto.admin;

import com.peaffee.dto.order.OrderResponse;

import java.util.List;

public record AdminStatsResponse(
        long totalOrders,
        long revenueCentsPaid,
        long ordersToday,
        long pendingWu,
        long newInquiries,
        long lowStockItems,
        List<DailyStat> daily,
        List<StatusCount> statusDistribution,
        List<TopProduct> topProducts,
        List<OrderResponse> recentOrders
) {
    public record DailyStat(String date, long orders, long revenueCents) {}
    public record StatusCount(String status, long count) {}
    public record TopProduct(String titleEn, String titleCn, String imageUrl, long qty, long revenueCents) {}
}
