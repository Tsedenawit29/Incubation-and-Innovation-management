package com.iims.iims.profile.entity;

import com.iims.iims.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "startup_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartupProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String startupName;

    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(length = 1000)
    private String website;
    private String phone;
    @Column(length = 1000)
    private String address;
    @Column(length = 1000)
    private String linkedin;
    @Column(length = 1000)
    private String twitter;
    @Column(length = 1000)
    private String logoUrl;

    @Column(columnDefinition = "TEXT")
    private String mission;
    @Column(columnDefinition = "TEXT")
    private String vision;

    // New fields for customization
    private String industry;
    private String country;
    private String city;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}