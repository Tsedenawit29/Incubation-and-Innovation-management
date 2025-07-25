package com.iims.iims.profile.entity;

import com.iims.iims.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp; // Import for CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp;   // Import for UpdateTimestamp

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

    @Column(nullable = false, length = 500) // Increased length for startupName, adjust as needed
    private String startupName;

    @Column(columnDefinition = "TEXT") // Allows for very long text
    private String description;

    @Column(length = 2048) // Increased length for URLs
    private String website;

    @Column(length = 50) // Phone numbers are typically shorter
    private String phone;

    @Column(length = 500) // Increased length for addresses
    private String address;

    @Column(length = 2048) // Increased length for social media URLs
    private String linkedin;

    @Column(length = 2048) // Increased length for social media URLs
    private String twitter;

    @Column(columnDefinition = "TEXT") // <--- CRITICAL CHANGE: Allows for very long Base64 image strings
    private String logoUrl;

    @Column(columnDefinition = "TEXT") // Allows for very long text
    private String mission;

    @Column(columnDefinition = "TEXT") // Allows for very long text
    private String vision;

    // New fields for customization - default length (255) is usually fine
    @Column(length = 100)
    private String industry;
    @Column(length = 100)
    private String country;
    @Column(length = 100)
    private String city;

    @CreationTimestamp // Automatically sets creation timestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp // Automatically updates timestamp on entity modification
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Removed @PrePersist and @PreUpdate as @CreationTimestamp and @UpdateTimestamp handle this.
}
