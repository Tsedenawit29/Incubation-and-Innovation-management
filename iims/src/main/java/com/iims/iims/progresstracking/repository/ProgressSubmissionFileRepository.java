package com.iims.iims.progresstracking.repository;

import com.iims.iims.progresstracking.entity.ProgressSubmissionFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProgressSubmissionFileRepository extends JpaRepository<ProgressSubmissionFile, UUID> {
} 