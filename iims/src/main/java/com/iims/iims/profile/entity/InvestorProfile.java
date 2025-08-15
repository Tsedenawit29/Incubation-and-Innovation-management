package com.iims.iims.profile.entity;

import com.iims.iims.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Entity class for an investor's profile.
 * Contains personal information, investment details, and portfolio information.
 */
@Entity
@Table(name = "investor_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestorProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 100)
    private String firstName;
    
    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 200)
    private String currentPosition;

    @Column(length = 200)
    private String currentCompany;

    @Column(length = 100)
    private String investmentFocus;

    @Column(columnDefinition = "TEXT")
    private String investmentPhilosophy;

    @Column(length = 2048)
    private String linkedin;

    @Column(length = 2048)
    private String twitter;

    @Column(columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(length = 100)
    private String country;
    
    @Column(length = 100)
    private String city;

    @Column(length = 50)
    private String phone;

    @Column(length = 500)
    private String address;

    @Column(length = 2048)
    private String website;

    @Column(length = 100)
    private String yearsOfExperience;

    @Column(length = 200)
    private String firmName;

    @Column(columnDefinition = "TEXT")
    private String investmentCriteria;

    @Column(columnDefinition = "TEXT")
    private String portfolioCompanies;

    @Column(columnDefinition = "TEXT")
    private String mentorshipAreas;

    @Column(length = 100)
    private String ticketSize;

    @Column(length = 100)
    private String investmentStage;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isPublic = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
