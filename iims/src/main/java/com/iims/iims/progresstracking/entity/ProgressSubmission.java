package com.iims.iims.progresstracking.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class ProgressSubmission {
    @Id
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "tracking_id")
    private StartupProgressTracking tracking;

    @ManyToOne
    @JoinColumn(name = "task_id")
    private ProgressTask task;

    private String submissionFileUrl;
    private String feedback;
    private String mentorFeedback;
    private String status; // e.g., 'COMPLETED', 'IN_PROGRESS', etc.
    private LocalDateTime submittedAt;
    private String comments;
    private BigDecimal score;
    private String rubric;
    private Integer version;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public StartupProgressTracking getTracking() { return tracking; }
    public void setTracking(StartupProgressTracking tracking) { this.tracking = tracking; }
    public ProgressTask getTask() { return task; }
    public void setTask(ProgressTask task) { this.task = task; }
    public String getSubmissionFileUrl() { return submissionFileUrl; }
    public void setSubmissionFileUrl(String submissionFileUrl) { this.submissionFileUrl = submissionFileUrl; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public String getMentorFeedback() { return mentorFeedback; }
    public void setMentorFeedback(String mentorFeedback) { this.mentorFeedback = mentorFeedback; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public BigDecimal getScore() { return score; }
    public void setScore(BigDecimal score) { this.score = score; }
    public String getRubric() { return rubric; }
    public void setRubric(String rubric) { this.rubric = rubric; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
} 