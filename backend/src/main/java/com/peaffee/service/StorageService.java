package com.peaffee.service;

import com.peaffee.config.AppProperties;
import com.peaffee.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.util.HexFormat;

@Service
public class StorageService {

    private final Path uploadDir;
    private final SecureRandom random = new SecureRandom();

    public StorageService(AppProperties app) {
        this.uploadDir = Path.of(app.uploadDir());
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Cannot create upload directory: " + uploadDir, e);
        }
    }

    /** Save a WU receipt under a random name; returns the web path /uploads/<file>. */
    public String saveReceipt(String orderNo, MultipartFile file) {
        String original = file.getOriginalFilename();
        String ext = (original != null && original.lastIndexOf('.') >= 0)
                ? original.substring(original.lastIndexOf('.')) : ".jpg";
        if (ext.length() > 10 || !ext.matches("\\.[A-Za-z0-9]+")) ext = ".jpg";
        ext = ext.toLowerCase();
        byte[] bytes = new byte[6];
        random.nextBytes(bytes);
        String filename = "wu-" + orderNo + "-" + HexFormat.of().formatHex(bytes) + ext;
        try {
            file.transferTo(uploadDir.resolve(filename));
        } catch (IOException e) {
            throw ApiException.badRequest("Could not save receipt");
        }
        return "/uploads/" + filename;
    }

    /** Resolve an uploaded filename to a filesystem path, blocking traversal. */
    public Path resolve(String filename) {
        Path p = uploadDir.resolve(filename).normalize();
        if (!p.startsWith(uploadDir)) throw ApiException.forbidden("Invalid path");
        return p;
    }
}
