package com.peaffee.dto.admin;

public record AdminStatsResponse(
        long totalOrders,
        long revenueCentsPaid,
        long ordersToday,
        long pendingWu,
        long newInquiries,
        long lowStockItems
) {}
