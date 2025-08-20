package com.iims.iims.auth.service;

import com.iims.iims.auth.entity.PasswordResetToken;
import com.iims.iims.auth.exception.InvalidTokenException;
import com.iims.iims.auth.exception.TokenExpiredException;
import com.iims.iims.auth.exception.UserNotFoundException;
import com.iims.iims.auth.repository.PasswordResetTokenRepository;
import com.iims.iims.notification.EmailService;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url:}")
    private String frontendUrl;

    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        // Invalidate any existing tokens for this user
        tokenRepository.deleteByUser(user);

        // Create new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        // Build reset link using configured base URL if present; otherwise fallback
        String baseUrl = (frontendUrl == null || frontendUrl.isBlank()) ? "http://localhost:3000" : frontendUrl;
        String resetLink = baseUrl + "/reset-password/" + token;
        sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired token"));

        if (resetToken.isExpired() || resetToken.isUsed()) {
            throw new TokenExpiredException("Token has expired or has already been used");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.markAsUsed();
        tokenRepository.save(resetToken);
    }

    @Transactional(readOnly = true)
    public boolean validateToken(String token) {
        return tokenRepository.findByToken(token)
                .map(t -> !t.isExpired() && !t.isUsed())
                .orElse(false);
    }

    private void sendPasswordResetEmail(String email, String name, String resetLink) {
        emailService.sendPasswordResetEmail(email, name, resetLink);
    }
}
