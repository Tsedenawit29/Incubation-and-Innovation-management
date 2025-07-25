package com.iims.iims.profile.entity;

import com.iims.iims.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List; // Import List
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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

    @Column(nullable = false, length = 500)
    private String startupName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 2048)
    private String website;

    @Column(length = 50)
    private String phone;

    @Column(length = 500)
    private String address;

    @Column(length = 2048)
    private String linkedin;

    @Column(length = 2048)
    private String twitter;

    @Column(columnDefinition = "TEXT") // Allows for very long Base64 image strings
    private String logoUrl;

    @Column(columnDefinition = "TEXT")
    private String mission;

    @Column(columnDefinition = "TEXT")
    private String vision;

    @Column(length = 100)
    private String industry;
    @Column(length = 100)
    private String country;
    @Column(length = 100)
    private String city;

    // --- NEW FIELDS FOR TEAM MEMBERS AND DOCUMENTS ---
    // Assuming you will create TeamMember and Document entities
    @OneToMany(mappedBy = "startupProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default // Lombok annotation to initialize the list
    private List<TeamMember> teamMembers = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "startupProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default // Lombok annotation to initialize the list
    private List<Document> documents = new java.util.ArrayList<>();
    // --- END NEW FIELDS ---

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
