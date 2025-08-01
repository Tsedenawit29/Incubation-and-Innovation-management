package com.iims.iims.profile.entity;

import com.iims.iims.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Entity class for a mentor's profile.
 * Contains personal information and a list of their areas of expertise.
 */
@Entity
@Table(name = "mentor_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorProfile {
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
    private String title;

    @Column(columnDefinition = "TEXT")
    private String experience;

    @Column(length = 2048)
    private String linkedin;

    @Column(length = 2048)
    private String twitter;

    @Column(columnDefinition = "TEXT") // Allows for very long Base64 image strings
    private String avatarUrl;

    @Column(length = 100)
    private String country;
    @Column(length = 100)
    private String city;

    // A mentor can have multiple areas of expertise
    @OneToMany(mappedBy = "mentorProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Expertise> expertise = new java.util.ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
