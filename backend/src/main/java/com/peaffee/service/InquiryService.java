package com.peaffee.service;

import com.peaffee.dto.inquiry.CreateInquiryRequest;
import com.peaffee.entity.Inquiry;
import com.peaffee.repository.InquiryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final EmailService emailService;

    public InquiryService(InquiryRepository inquiryRepository, EmailService emailService) {
        this.inquiryRepository = inquiryRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Inquiry create(CreateInquiryRequest req) {
        Inquiry inquiry = new Inquiry();
        inquiry.setName(req.name().trim());
        inquiry.setEmail(req.email().trim().toLowerCase());
        inquiry.setInterest(req.interest() == null || req.interest().isBlank() ? null : req.interest().trim());
        inquiry.setMessage(req.message().trim());
        inquiryRepository.save(inquiry);
        emailService.sendInquiryNotificationEmail(inquiry);
        return inquiry;
    }
}
