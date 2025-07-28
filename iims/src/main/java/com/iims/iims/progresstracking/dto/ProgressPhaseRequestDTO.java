package com.iims.iims.progresstracking.dto;

import java.util.UUID;

public class ProgressPhaseRequestDTO {
    private UUID templateId;
    private String name;
    private int orderIndex;
    // getters and setters
    public UUID getTemplateId() { return templateId; }
    public void setTemplateId(UUID templateId) { this.templateId = templateId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
} 