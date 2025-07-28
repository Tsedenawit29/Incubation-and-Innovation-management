package com.iims.iims.progresstracking.repository;

import com.iims.iims.progresstracking.entity.ProgressTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface ProgressTaskRepository extends JpaRepository<ProgressTask, UUID> {
    List<ProgressTask> findByPhaseId(UUID phaseId);
} 