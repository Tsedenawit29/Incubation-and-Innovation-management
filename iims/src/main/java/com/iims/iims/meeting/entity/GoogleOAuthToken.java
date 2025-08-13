package com.iims.iims.meeting.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "google_oauth_tokens",
       uniqueConstraints = { @UniqueConstraint(columnNames = {"user_id"}), @UniqueConstraint(columnNames = {"tenant_id"}) })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleOAuthToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Either userId or tenantId is set (mutually exclusive)
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "access_token", columnDefinition = "TEXT")
    private String accessToken;

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken; // MUST be encrypted at rest

    @Column(name = "scope")
    private String scope;

    @Column(name = "token_type")
    private String tokenType;

    @Column(name = "expiry_time")
    private Instant expiryTime;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    public void onCreate() { createdAt = Instant.now(); }
}
