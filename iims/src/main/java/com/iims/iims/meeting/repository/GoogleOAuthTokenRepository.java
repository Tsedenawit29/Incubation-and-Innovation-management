package com.iims.iims.meeting.repository;

import com.iims.iims.meeting.entity.GoogleOAuthToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GoogleOAuthTokenRepository extends JpaRepository<GoogleOAuthToken, UUID> {
    Optional<GoogleOAuthToken> findByUserId(UUID userId);
    Optional<GoogleOAuthToken> findByTenantId(UUID tenantId);
}
