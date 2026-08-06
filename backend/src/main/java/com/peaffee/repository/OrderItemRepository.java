package com.peaffee.repository;

import com.peaffee.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    /** Best-selling products across PAID orders, by total quantity. */
    @Query(value = """
        select oi.title_en, oi.title_cn, oi.image_url,
               sum(oi.quantity) as qty, sum(oi.line_total_cents) as revenue
        from order_items oi
        join orders o on o.id = oi.order_id
        where o.payment_status = 'paid'
        group by oi.title_en, oi.title_cn, oi.image_url
        order by qty desc
        limit :limit
        """, nativeQuery = true)
    List<Object[]> topProducts(@Param("limit") int limit);
}
