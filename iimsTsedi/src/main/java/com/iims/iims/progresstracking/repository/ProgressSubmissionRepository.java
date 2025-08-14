package com.iims.iims.progresstracking.repository;

import com.iims.iims.progresstracking.entity.ProgressSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
 
public interface ProgressSubmissionRepository extends JpaRepository<ProgressSubmission, UUID> {
} 