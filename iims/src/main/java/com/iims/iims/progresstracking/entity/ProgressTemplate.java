package com.iims.iims.progresstracking.entity;

import com.iims.iims.tenant.entity.Tenant;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class ProgressTemplate {
    @Id
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    private String name;
    private String description;
    private LocalDateTime createdAt;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Tenant getTenant() { return tenant; }
    public void setTenant(Tenant tenant) { this.tenant = tenant; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
} 