package com.peaffee.repository;

import com.peaffee.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    @Query("select u from User u where u.email = :identifier or u.username = :identifier")
    Optional<User> findByEmailOrUsername(@Param("identifier") String identifier);

    Optional<User> findByResetTokenAndResetTokenExpiresAtAfter(String resetToken, Instant after);
}
