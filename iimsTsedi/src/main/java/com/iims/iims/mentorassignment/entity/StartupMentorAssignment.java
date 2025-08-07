package com.iims.iims.mentorassignment.entity;

import com.iims.iims.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class StartupMentorAssignment {
    @Id
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "startup_id")
    private User startup;

    @ManyToOne
    @JoinColumn(name = "mentor_id")
    private User mentor;

    private LocalDateTime assignedAt;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getStartup() { return startup; }
    public void setStartup(User startup) { this.startup = startup; }
    public User getMentor() { return mentor; }
    public void setMentor(User mentor) { this.mentor = mentor; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
} 