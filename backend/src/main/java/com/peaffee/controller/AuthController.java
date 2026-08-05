package com.peaffee.controller;

import com.peaffee.dto.AuthResponse;
import com.peaffee.dto.UserResponse;
import com.peaffee.dto.auth.ForgotPasswordRequest;
import com.peaffee.dto.auth.LoginRequest;
import com.peaffee.dto.auth.RegisterRequest;
import com.peaffee.dto.auth.ResetPasswordRequest;
import com.peaffee.exception.ApiException;
import com.peaffee.security.CurrentUser;
import com.peaffee.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/google")
    public AuthResponse googleLogin(@Valid @RequestBody com.peaffee.dto.auth.GoogleAuthRequest req) {
        return authService.googleLogin(req);
    }

    /** Stateless JWT: logout is client-side (discard token). Return 204 for parity. */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public Map<String, UserResponse> me() {
        Long uid = CurrentUser.id();
        if (uid == null) throw ApiException.unauthorized("Not authenticated");
        return Map.of("user", authService.me(uid));
    }

    @PostMapping("/forgot-password")
    public Map<String, Boolean> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req);
        return Map.of("ok", true);
    }

    @PostMapping("/reset-password")
    public Map<String, Boolean> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req);
        return Map.of("ok", true);
    }
}
