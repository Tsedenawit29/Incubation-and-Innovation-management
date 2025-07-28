package com.iims.iims.progresstracking.dto;

import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProgressSubmissionRequestDTO {
    private UUID trackingId;
    private UUID taskId;
    private String submissionFileUrl;
    private String feedback;
    private String mentorFeedback;
    private LocalDateTime submittedAt;
    private String status;
    private String comments;
    private BigDecimal score;
    private String rubric;
    private Integer version;
    // getters and setters
    public UUID getTrackingId() { return trackingId; }
    public void setTrackingId(UUID trackingId) { this.trackingId = trackingId; }
    public UUID getTaskId() { return taskId; }
    public void setTaskId(UUID taskId) { this.taskId = taskId; }
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