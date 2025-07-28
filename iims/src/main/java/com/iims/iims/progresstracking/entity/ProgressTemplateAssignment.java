package com.iims.iims.progresstracking.entity;

import com.iims.iims.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class ProgressTemplateAssignment {
    @Id
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "template_id")
    private ProgressTemplate template;

    private String assignedToType; // 'USER', 'COHORT', 'GROUP', etc.
    private UUID assignedToId;

    @ManyToOne
    @JoinColumn(name = "assigned_by")
    private User assignedBy;

    private LocalDateTime assignedAt;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ProgressTemplate getTemplate() { return template; }
    public void setTemplate(ProgressTemplate template) { this.template = template; }
    public String getAssignedToType() { return assignedToType; }
    public void setAssignedToType(String assignedToType) { this.assignedToType = assignedToType; }
    public UUID getAssignedToId() { return assignedToId; }
    public void setAssignedToId(UUID assignedToId) { this.assignedToId = assignedToId; }
    public User getAssignedBy() { return assignedBy; }
    public void setAssignedBy(User assignedBy) { this.assignedBy = assignedBy; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
} 