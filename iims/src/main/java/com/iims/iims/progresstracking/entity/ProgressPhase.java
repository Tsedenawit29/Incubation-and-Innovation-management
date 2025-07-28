package com.iims.iims.progresstracking.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
public class ProgressPhase {
    @Id
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "template_id")
    private ProgressTemplate template;

    private String name;
    private int orderIndex;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ProgressTemplate getTemplate() { return template; }
    public void setTemplate(ProgressTemplate template) { this.template = template; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
} 