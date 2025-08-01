package com.iims.iims.profile.repository;

import com.iims.iims.profile.entity.Expertise;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

/**
 * JPA Repository for the Expertise entity.
 */
public interface ExpertiseRepository extends JpaRepository<Expertise, UUID> {
}
