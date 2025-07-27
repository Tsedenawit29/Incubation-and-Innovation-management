package com.iims.iims.progresstracking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class StartupProgressTracking {
    @Id
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "assignment_id")
    private ProgressTemplateAssignment assignment;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ProgressTemplateAssignment getAssignment() { return assignment; }
    public void setAssignment(ProgressTemplateAssignment assignment) { this.assignment = assignment; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
} 