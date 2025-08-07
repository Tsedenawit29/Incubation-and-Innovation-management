package com.iims.iims.progresstracking.dto;

import java.util.UUID;
import java.time.LocalDateTime;

public class StartupProgressTrackingRequestDTO {
    private UUID assignmentId;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    // getters and setters
    public UUID getAssignmentId() { return assignmentId; }
    public void setAssignmentId(UUID assignmentId) { this.assignmentId = assignmentId; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
} 