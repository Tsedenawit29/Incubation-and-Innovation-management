package com.iims.iims.profile.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

/**
 * Entity class for an expertise area belonging to a mentor.
 * This is a child entity of MentorProfile.
 */
@Entity
@Table(name = "mentor_expertise")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expertise {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_profile_id", nullable = false)
    private MentorProfile mentorProfile;

    @Column(nullable = false, length = 200)
    private String expertiseName;

    @Column(columnDefinition = "TEXT")
    private String description;
}
