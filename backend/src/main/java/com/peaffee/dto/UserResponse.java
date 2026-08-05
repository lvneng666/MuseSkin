package com.peaffee.dto;

import com.peaffee.entity.User;

/** {id, email, full_name, role, username}. */
public record UserResponse(Long id, String email, String fullName, String role, String username) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRole().name(), user.getUsername());
    }
}
