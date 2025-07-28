package com.iims.iims.progresstracking.dto;

import java.util.UUID;

public class ProgressTemplateRequestDTO {
    private UUID tenantId;
    private String name;
    private String description;
    // getters and setters
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
} 