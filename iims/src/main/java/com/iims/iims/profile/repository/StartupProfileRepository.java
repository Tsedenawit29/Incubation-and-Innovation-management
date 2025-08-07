package com.iims.iims.profile.repository;

import com.iims.iims.profile.entity.StartupProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface StartupProfileRepository extends JpaRepository<StartupProfile, UUID> {
    Optional<StartupProfile> findByUserId(UUID userId);
}