package com.peaffee.repository;

import com.peaffee.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByStatusOrderBySortOrderAscTitleEnAsc(Product.ProductStatus status);

    List<Product> findByStatusAndCategoryOrderBySortOrderAscTitleEnAsc(Product.ProductStatus status, Product.Category category);

    Optional<Product> findBySlugAndStatus(String slug, Product.ProductStatus status);

    Optional<Product> findBySlug(String slug);

    List<Product> findByStatusOrderBySortOrderAsc(Product.ProductStatus status);

    /** Lock product rows for a payment-confirm stock decrement. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id in :ids")
    List<Product> lockByIds(@Param("ids") List<Long> ids);

    /** Atomic decrement that only succeeds when enough stock exists. */
    @Modifying
    @Query("update Product p set p.stock = p.stock - :qty where p.id = :id and p.stock >= :qty")
    int decrementStockIfEnough(@Param("id") Long id, @Param("qty") int qty);

    @Query("select count(p) from Product p where p.status = com.peaffee.entity.Product.ProductStatus.active and p.stock <= :threshold")
    long countLowStock(@Param("threshold") int threshold);
}
