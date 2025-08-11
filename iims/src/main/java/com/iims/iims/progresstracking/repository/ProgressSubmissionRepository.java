package com.iims.iims.progresstracking.repository;

import com.iims.iims.progresstracking.entity.ProgressSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ProgressSubmissionRepository extends JpaRepository<ProgressSubmission, UUID> {
    
    /**
     * Find all submissions for a specific task
     */
    List<ProgressSubmission> findByTaskId(UUID taskId);
}