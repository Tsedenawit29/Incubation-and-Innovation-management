package com.iims.iims.profile.repository;

import com.iims.iims.profile.entity.MentorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

/**
 * JPA Repository for MentorProfile entities.
 * Provides methods for database interactions, including finding a profile by user ID.
 */
public interface MentorProfileRepository extends JpaRepository<MentorProfile, UUID> {
    Optional<MentorProfile> findByUserId(UUID userId);
}
