package com.iims.iims.auth.repository;

import com.iims.iims.auth.entity.PasswordResetToken;
import com.iims.iims.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUserAndUsedIsFalseAndExpiryDateAfter(User user, java.time.LocalDateTime now);
    void deleteByUser(User user);
}
