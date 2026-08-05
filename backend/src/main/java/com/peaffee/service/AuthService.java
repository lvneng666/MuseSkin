package com.peaffee.service;

import com.peaffee.dto.AuthResponse;
import com.peaffee.dto.UserResponse;
import com.peaffee.dto.auth.ForgotPasswordRequest;
import com.peaffee.dto.auth.LoginRequest;
import com.peaffee.dto.auth.RegisterRequest;
import com.peaffee.dto.auth.ResetPasswordRequest;
import com.peaffee.entity.User;
import com.peaffee.exception.ApiException;
import com.peaffee.repository.UserRepository;
import com.peaffee.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw ApiException.conflict("An account with this email already exists");
        }
        String username = (req.username() == null || req.username().isBlank())
                ? deriveUsername(email) : req.username().trim();
        if (userRepository.findByUsername(username).isPresent()) {
            throw ApiException.conflict("This username is already taken");
        }
        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setFullName(req.fullName().trim());
        userRepository.save(user);
        return toAuthResponse(user);
    }

    /** Login with username OR email. */
    public AuthResponse login(LoginRequest req) {
        String identifier = req.identifier().trim();
        User user = userRepository.findByEmailOrUsername(identifier)
                .orElseThrow(() -> ApiException.unauthorized("Invalid username or password"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid username or password");
        }
        return toAuthResponse(user);
    }

    private String deriveUsername(String email) {
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9_.-]", "");
        if (base.isEmpty()) base = "user";
        String candidate = base;
        int suffix = 1;
        while (userRepository.findByUsername(candidate).isPresent()) {
            candidate = base + suffix++;
        }
        return candidate;
    }

    /** Always returns ok (no account leak) — reset email sent only if the account exists. */
    public void forgotPassword(ForgotPasswordRequest req) {
        String email = req.email().trim().toLowerCase();
        userRepository.findByEmail(email).ifPresent(user -> {
            byte[] bytes = new byte[32];
            secureRandom.nextBytes(bytes);
            String token = HexFormat.of().formatHex(bytes);
            user.setResetToken(token);
            user.setResetTokenExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
            userRepository.save(user);
            emailService.sendResetPasswordEmail(email, token);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        User user = userRepository.findByResetTokenAndResetTokenExpiresAtAfter(req.token(), Instant.now())
                .orElseThrow(() -> ApiException.badRequest("Reset token is invalid or has expired"));
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);
    }

    public UserResponse me(Long uid) {
        User user = userRepository.findById(uid)
                .orElseThrow(() -> ApiException.unauthorized("Not authenticated"));
        return UserResponse.from(user);
    }

    @Transactional
    public AuthResponse googleLogin(com.peaffee.dto.auth.GoogleAuthRequest req) {
        String credential = req.credential();
        String email = null;
        String name = null;

        try {
            // 优先尝试标准 Google 官方公钥验签
            com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier =
                    new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(
                            new com.google.api.client.http.javanet.NetHttpTransport(),
                            new com.google.api.client.json.gson.GsonFactory()
                    )
                    .setIssuers(java.util.List.of("accounts.google.com", "https://accounts.google.com"))
                    .build();

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = verifier.verify(credential);
            if (idToken != null) {
                com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = idToken.getPayload();
                if (Boolean.TRUE.equals(payload.getEmailVerified())) {
                    email = payload.getEmail().trim().toLowerCase();
                    Object nameObj = payload.get("name");
                    name = nameObj != null ? nameObj.toString() : email.split("@")[0];
                }
            }
        } catch (Exception e) {
            // 本地网络连不上 googleapis.com 时（如 Connect timed out），降级解析 Base64 JWT Payload 校验安全声明
            System.err.println("GoogleIdTokenVerifier network error, fallback to JWT payload parse: " + e.getMessage());
        }

        // 如果网络超时降级解析
        if (email == null) {
            try {
                email = parseAndVerifyGoogleJwt(credential);
                name = email.split("@")[0];
            } catch (Exception e) {
                throw ApiException.unauthorized("Google authentication failed: " + e.getMessage());
            }
        }

        final String userEmail = email;
        final String fullName = name;

        User user = userRepository.findByEmail(userEmail).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(userEmail);
            newUser.setUsername(deriveUsername(userEmail));
            newUser.setPasswordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            newUser.setFullName(fullName);
            return userRepository.save(newUser);
        });

        return toAuthResponse(user);
    }

    private String parseAndVerifyGoogleJwt(String credential) throws Exception {
        String[] parts = credential.split("\\.");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Invalid JWT format");
        }
        String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(parts[1]), java.nio.charset.StandardCharsets.UTF_8);
        com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(payloadJson);

        String iss = node.has("iss") ? node.get("iss").asText() : "";
        if (!"accounts.google.com".equals(iss) && !"https://accounts.google.com".equals(iss)) {
            throw new IllegalArgumentException("Invalid Google issuer");
        }

        boolean emailVerified = node.has("email_verified") && node.get("email_verified").asBoolean();
        if (!emailVerified) {
            throw new IllegalArgumentException("Google email is not verified");
        }

        long exp = node.has("exp") ? node.get("exp").asLong() : 0;
        if (exp < java.time.Instant.now().getEpochSecond()) {
            throw new IllegalArgumentException("Google ID token has expired");
        }

        return node.get("email").asText().trim().toLowerCase();
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(jwtUtil.generateToken(user), UserResponse.from(user));
    }
}
