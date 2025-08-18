package com.iims.iims.auth.service;

import com.iims.iims.auth.entity.RefreshToken;
import com.iims.iims.auth.repository.RefreshTokenRepository;
import com.iims.iims.user.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Value("${jwt.refreshExpirationMs}")
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }
     
    @Transactional
public RefreshToken createOrUpdateRefreshToken(User user) {
    // 1. Check if a token for the user already exists
    Optional<RefreshToken> existingTokenOpt = refreshTokenRepository.findByUser(user);

    RefreshToken refreshToken;
    if (existingTokenOpt.isPresent()) {
        // 2. If it exists, update the token and expiry date
        refreshToken = existingTokenOpt.get();
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(604800000L));
    } else {
        // 3. If it doesn't exist, create a new one
        refreshToken = RefreshToken.builder()
            .user(user)
            .token(UUID.randomUUID().toString())
            .expiryDate(Instant.now().plusMillis(604800000L))
            .build();
    }
    return refreshTokenRepository.save(refreshToken); // This handles both UPDATE and INSERT
}

    public boolean isTokenExpired(RefreshToken token) {
        return token.getExpiryDate().isBefore(Instant.now());
    }

    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByToken(token).orElse(null);
    }
}
