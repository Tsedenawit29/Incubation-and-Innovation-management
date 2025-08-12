package com.iims.iims.progresstracking.repository;

import com.iims.iims.progresstracking.entity.ProgressSubmissionFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface ProgressSubmissionFileRepository extends JpaRepository<ProgressSubmissionFile, UUID> {
    
    // Find all files associated with a specific submission
    @Query("SELECT f FROM ProgressSubmissionFile f WHERE f.submission.id = :submissionId")
    List<ProgressSubmissionFile> findBySubmissionId(@Param("submissionId") UUID submissionId);
    
    // Delete all files associated with a specific submission
    @Modifying
    @Query("DELETE FROM ProgressSubmissionFile f WHERE f.submission.id = :submissionId")
    void deleteBySubmissionId(@Param("submissionId") UUID submissionId);
}