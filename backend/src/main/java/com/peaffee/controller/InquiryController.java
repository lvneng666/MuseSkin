package com.peaffee.controller;

import com.peaffee.dto.inquiry.CreateInquiryRequest;
import com.peaffee.entity.Inquiry;
import com.peaffee.service.InquiryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    private final InquiryService inquiryService;

    public InquiryController(InquiryService inquiryService) {
        this.inquiryService = inquiryService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Inquiry>> create(@Valid @RequestBody CreateInquiryRequest req) {
        Inquiry inquiry = inquiryService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("inquiry", inquiry));
    }
}
