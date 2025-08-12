package com.iims.iims.progresstracking.service;

import com.iims.iims.progresstracking.entity.ProgressSubmissionFile;
import com.iims.iims.progresstracking.repository.ProgressSubmissionFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProgressSubmissionFileService {
    @Autowired
    private ProgressSubmissionFileRepository fileRepo;

    public ProgressSubmissionFile createFile(ProgressSubmissionFile file) {
        file.setId(UUID.randomUUID());
        return fileRepo.save(file);
    }

    public List<ProgressSubmissionFile> getAllFiles() {
        return fileRepo.findAll();
    }

    public Optional<ProgressSubmissionFile> getFileById(UUID id) {
        return fileRepo.findById(id);
    }

    public ProgressSubmissionFile updateFile(ProgressSubmissionFile file) {
        return fileRepo.save(file);
    }

    public void deleteFile(UUID id) {
        fileRepo.deleteById(id);
    }

    // Find all files associated with a specific submission
    public List<ProgressSubmissionFile> getFilesBySubmissionId(UUID submissionId) {
        return fileRepo.findBySubmissionId(submissionId);
    }

    // Delete all files associated with a specific submission (for cascading delete)
    @Transactional
    public void deleteFilesBySubmissionId(UUID submissionId) {
        fileRepo.deleteBySubmissionId(submissionId);
    }
}