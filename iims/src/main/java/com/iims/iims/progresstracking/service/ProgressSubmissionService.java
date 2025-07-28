package com.iims.iims.progresstracking.service;

import com.iims.iims.progresstracking.entity.ProgressSubmission;
import com.iims.iims.progresstracking.repository.ProgressSubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProgressSubmissionService {
    @Autowired
    private ProgressSubmissionRepository submissionRepo;

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

    public void deleteSubmission(UUID id) {
        submissionRepo.deleteById(id);
    }
} 