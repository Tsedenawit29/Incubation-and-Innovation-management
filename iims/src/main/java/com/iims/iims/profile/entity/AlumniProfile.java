package com.iims.iims.profile.entity;

import com.iims.iims.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Entity class for an alumni's profile.
 * Contains personal information, company details, and success story.
 */
@Entity
@Table(name = "alumni_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlumniProfile {
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
    private String industry;

    @Column(columnDefinition = "TEXT")
    private String successStory;

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
    private String graduationYear;

    @Column(length = 200)
    private String degree;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String achievements;

    @Column(columnDefinition = "TEXT")
    private String mentorshipInterests;

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
