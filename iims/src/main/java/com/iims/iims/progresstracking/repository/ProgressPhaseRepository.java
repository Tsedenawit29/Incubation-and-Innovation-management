package com.iims.iims.progresstracking.repository;

import com.iims.iims.progresstracking.entity.ProgressPhase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface ProgressPhaseRepository extends JpaRepository<ProgressPhase, UUID> {
    List<ProgressPhase> findByTemplate_Id(UUID templateId);
} 