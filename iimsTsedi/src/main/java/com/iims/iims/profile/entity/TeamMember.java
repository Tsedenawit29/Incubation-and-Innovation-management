package com.iims.iims.profile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "team_members") // Table name for team members
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMember {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ManyToOne relationship with StartupProfile
    // Each team member belongs to one startup profile
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "startup_profile_id", nullable = false) // Foreign key column
    private StartupProfile startupProfile;

    @Column(nullable = false, length = 255) // Name of the team member
    private String name;

    @Column(length = 255) // Role of the team member (e.g., "CEO", "CTO")
    private String role;

    @Column(length = 2048) // URL for LinkedIn profile
    private String linkedin;

    @Column(columnDefinition = "TEXT") // URL or Base64 string for avatar image
    private String avatarUrl;
}
