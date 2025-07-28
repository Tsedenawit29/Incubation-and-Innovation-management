package com.iims.iims.progresstracking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class ProgressSubmissionFile {
    @Id
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "submission_id")
    private ProgressSubmission submission;

    private String fileUrl;
    private LocalDateTime uploadedAt;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ProgressSubmission getSubmission() { return submission; }
    public void setSubmission(ProgressSubmission submission) { this.submission = submission; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
} 