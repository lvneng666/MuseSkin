package com.peaffee.controller.admin;

import com.peaffee.exception.ApiException;
import com.peaffee.service.StorageService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;

/** Serves an uploaded Western Union receipt to an admin (never public). */
@RestController
@RequestMapping("/api/admin/receipts")
public class AdminReceiptController {

    private final StorageService storageService;

    public AdminReceiptController(StorageService storageService) {
        this.storageService = storageService;
    }

    @GetMapping("/{file}")
    public ResponseEntity<Resource> get(@PathVariable String file) {
        Path path = storageService.resolve(file);
        Resource resource = new FileSystemResource(path);
        if (!resource.exists()) throw ApiException.notFound("Not found");
        MediaType mediaType = mediaTypeFor(file);
        return ResponseEntity.ok().contentType(mediaType).body(resource);
    }

    private MediaType mediaTypeFor(String file) {
        String lower = file.toLowerCase();
        if (lower.endsWith(".pdf")) return MediaType.APPLICATION_PDF;
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (lower.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        if (lower.endsWith(".gif")) return MediaType.IMAGE_GIF;
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
