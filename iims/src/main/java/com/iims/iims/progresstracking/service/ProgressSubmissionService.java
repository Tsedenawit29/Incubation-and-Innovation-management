package com.iims.iims.progresstracking.service;

import com.iims.iims.progresstracking.entity.ProgressSubmission;
import com.iims.iims.progresstracking.repository.ProgressSubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProgressSubmissionService {
    @Autowired
    private ProgressSubmissionRepository submissionRepo;
    
    @Autowired
    private ProgressSubmissionFileService fileService;

    public ProgressSubmission createSubmission(ProgressSubmission submission) {
        submission.setId(UUID.randomUUID());
        return submissionRepo.save(submission);
    }

    public List<ProgressSubmission> getAllSubmissions() {
        return submissionRepo.findAll();
    }

    public Optional<ProgressSubmission> getSubmissionById(UUID id) {
        return submissionRepo.findById(id);
    }

    public ProgressSubmission updateSubmission(ProgressSubmission submission) {
        return submissionRepo.save(submission);
    }

    /**
     * Delete submission with proper cascading deletion of associated files
     * This method first deletes all associated files, then deletes the submission
     * to avoid foreign key constraint violations
     */
    @Transactional
    public void deleteSubmission(UUID id) {
        // First, delete all associated files to avoid foreign key constraint violation
        fileService.deleteFilesBySubmissionId(id);
        
        // Then delete the submission itself
        submissionRepo.deleteById(id);
    }

    /**
     * Get all submissions for a specific task
     */
    public List<ProgressSubmission> getSubmissionsByTaskId(UUID taskId) {
        return submissionRepo.findByTaskId(taskId);
    }
}