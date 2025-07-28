package com.iims.iims.progresstracking.entity;

import com.iims.iims.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class ProgressActivityLog {
    @Id
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "tracking_id")
    private StartupProgressTracking tracking;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String action;
    private String details;
    private LocalDateTime createdAt;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public StartupProgressTracking getTracking() { return tracking; }
    public void setTracking(StartupProgressTracking tracking) { this.tracking = tracking; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
} 