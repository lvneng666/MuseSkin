package com.peaffee.controller.admin;

import com.peaffee.entity.Inquiry;
import com.peaffee.exception.ApiException;
import com.peaffee.repository.InquiryRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/inquiries")
public class AdminInquiryController {

    private final InquiryRepository inquiryRepository;

    public AdminInquiryController(InquiryRepository inquiryRepository) {
        this.inquiryRepository = inquiryRepository;
    }

    @GetMapping
    public Map<String, List<Inquiry>> list(@RequestParam(required = false) String status) {
        List<Inquiry> list = (status == null || status.isBlank())
                ? inquiryRepository.findAllByOrderByCreatedAtDesc()
                : inquiryRepository.findByStatusOrderByCreatedAtDesc(status);
        return Map.of("inquiries", list);
    }

    @PatchMapping("/{id}")
    public Map<String, Inquiry> patch(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || !(status.equals("new") || status.equals("resolved"))) {
            throw ApiException.badRequest("status must be new or resolved");
        }
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Inquiry not found"));
        inquiry.setStatus(status);
        inquiryRepository.save(inquiry);
        return Map.of("inquiry", inquiry);
    }
}
