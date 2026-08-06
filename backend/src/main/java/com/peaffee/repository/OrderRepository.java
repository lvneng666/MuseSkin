package com.peaffee.repository;

import com.peaffee.entity.Order;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNo(String orderNo);

    Optional<Order> findByCustomerEmailAndOrderNo(String customerEmail, String orderNo);

    Optional<Order> findByOrderNoAndUserId(String orderNo, Long userId);

    List<Order> findByUserIdOrderByPlacedAtDesc(Long userId);

    /** Lock the order row for the payment-confirm transaction. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.orderNo = :orderNo")
    Optional<Order> findByOrderNoForUpdate(@Param("orderNo") String orderNo);

    // NOTE: avoid concat() here — Hibernate can bind the String param as bytea on
    // PostgreSQL, producing `lower(bytea)` SQL errors. Pass the wrapped %pattern%
    // (already lowercased) as the param instead.
    @Query("""
        select o from Order o where
          (:orderStatus is null or o.orderStatus = :orderStatus) and
          (:paymentStatus is null or o.paymentStatus = :paymentStatus) and
          (:q is null or lower(cast(o.customerEmail as string)) like :q
                     or lower(cast(o.orderNo as string)) like :q)
        order by o.placedAt desc
        """)
    List<Order> search(@Param("orderStatus") Order.OrderStatus orderStatus,
                       @Param("paymentStatus") Order.PaymentStatus paymentStatus,
                       @Param("q") String q);

    @Query("select coalesce(sum(o.totalCents), 0) from Order o where o.paymentStatus = com.peaffee.entity.Order.PaymentStatus.paid")
    long sumTotalCentsPaid();

    @Query("select count(o) from Order o where o.placedAt >= :startOfDay")
    long countPlacedSince(@Param("startOfDay") Instant startOfDay);

    @Query("select count(o) from Order o where o.paymentStatus = com.peaffee.entity.Order.PaymentStatus.awaiting_confirmation")
    long countPendingWu();

    /** Per-day order count + paid revenue since :from (Beijing time). Native: to_char/day grouping. */
    @Query(value = """
        select to_char(placed_at at time zone 'Asia/Shanghai', 'YYYY-MM-DD') as date,
               count(*) as orders,
               coalesce(sum(case when payment_status = 'paid' then total_cents else 0 end), 0) as revenue
        from orders
        where placed_at >= :from
        group by date
        order by date
        """, nativeQuery = true)
    List<Object[]> dailyStats(@Param("from") Instant from);

    /** Order-status → count distribution. */
    @Query(value = "select order_status as status, count(*) as cnt from orders group by order_status order by cnt desc", nativeQuery = true)
    List<Object[]> statusDistribution();

    List<Order> findTop8ByOrderByPlacedAtDesc();
}
