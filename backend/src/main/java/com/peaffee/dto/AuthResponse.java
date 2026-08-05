package com.peaffee.dto;

/** {token, user} — token added on top of the Node {user} shape (additive, frontend-compatible). */
public record AuthResponse(String token, UserResponse user) {}
