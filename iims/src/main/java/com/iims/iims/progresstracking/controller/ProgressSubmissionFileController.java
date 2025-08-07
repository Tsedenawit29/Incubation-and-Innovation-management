package com.iims.iims.progresstracking.controller;

import com.iims.iims.progresstracking.entity.ProgressSubmissionFile;
import com.iims.iims.progresstracking.service.ProgressSubmissionFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.iims.iims.progresstracking.entity.ProgressSubmission;

@RestController
@RequestMapping("/api/progresstracking/submission-files")
public class ProgressSubmissionFileController {
    @Autowired
    private ProgressSubmissionFileService fileService;

    @PostMapping
    public ResponseEntity<ProgressSubmissionFile> create(@RequestBody ProgressSubmissionFile file) {
        return ResponseEntity.ok(fileService.createFile(file));
    }

    @PostMapping("/upload")
    public ResponseEntity<ProgressSubmissionFile> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("submissionId") UUID submissionId) {
        try {
            // Store file on disk (uploads/progress/)
            String uploadDir = "uploads/progress/";
            Files.createDirectories(Paths.get(uploadDir));
            String filename = submissionId + "-" + System.currentTimeMillis() + "-" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, filename);
            Files.write(filePath, file.getBytes());
            // Create ProgressSubmissionFile entity
            ProgressSubmissionFile psf = new ProgressSubmissionFile();
            psf.setId(UUID.randomUUID());
            psf.setFileUrl("/" + uploadDir + filename);
            psf.setUploadedAt(LocalDateTime.now());
            // Link to ProgressSubmission
            ProgressSubmission submission = new ProgressSubmission();
            submission.setId(submissionId);
            psf.setSubmission(submission);
            ProgressSubmissionFile saved = fileService.createFile(psf);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<ProgressSubmissionFile>> getAll() {
        return ResponseEntity.ok(fileService.getAllFiles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgressSubmissionFile> getById(@PathVariable UUID id) {
        Optional<ProgressSubmissionFile> file = fileService.getFileById(id);
        return file.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgressSubmissionFile> update(@PathVariable UUID id, @RequestBody ProgressSubmissionFile file) {
        file.setId(id);
        return ResponseEntity.ok(fileService.updateFile(file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        fileService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }
} 