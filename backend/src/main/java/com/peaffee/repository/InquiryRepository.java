package com.peaffee.repository;

import com.peaffee.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    List<Inquiry> findByStatusOrderByCreatedAtDesc(String status);

    List<Inquiry> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);
}
