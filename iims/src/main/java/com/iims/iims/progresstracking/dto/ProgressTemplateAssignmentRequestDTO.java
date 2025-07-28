package com.iims.iims.progresstracking.dto;

import java.util.UUID;

public class ProgressTemplateAssignmentRequestDTO {
    private UUID templateId;
    private String assignedToType;
    private UUID assignedToId;
    private UUID assignedById;
    // getters and setters
    public UUID getTemplateId() { return templateId; }
    public void setTemplateId(UUID templateId) { this.templateId = templateId; }
    public String getAssignedToType() { return assignedToType; }
    public void setAssignedToType(String assignedToType) { this.assignedToType = assignedToType; }
    public UUID getAssignedToId() { return assignedToId; }
    public void setAssignedToId(UUID assignedToId) { this.assignedToId = assignedToId; }
    public UUID getAssignedById() { return assignedById; }
    public void setAssignedById(UUID assignedById) { this.assignedById = assignedById; }
} 