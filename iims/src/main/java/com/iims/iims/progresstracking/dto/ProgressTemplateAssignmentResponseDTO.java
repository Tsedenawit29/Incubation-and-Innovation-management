package com.iims.iims.progresstracking.dto;

import java.util.UUID;
import java.time.LocalDateTime;

public class ProgressTemplateAssignmentResponseDTO {
    private UUID id;
    private UUID templateId;
    private String assignedToType;
    private UUID assignedToId;
    private UUID assignedById;
    private LocalDateTime assignedAt;
    // getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTemplateId() { return templateId; }
    public void setTemplateId(UUID templateId) { this.templateId = templateId; }
    public String getAssignedToType() { return assignedToType; }
    public void setAssignedToType(String assignedToType) { this.assignedToType = assignedToType; }
    public UUID getAssignedToId() { return assignedToId; }
    public void setAssignedToId(UUID assignedToId) { this.assignedToId = assignedToId; }
    public UUID getAssignedById() { return assignedById; }
    public void setAssignedById(UUID assignedById) { this.assignedById = assignedById; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
} 