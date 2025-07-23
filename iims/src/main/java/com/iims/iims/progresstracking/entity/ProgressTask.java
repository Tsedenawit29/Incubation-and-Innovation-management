package com.iims.iims.progresstracking.entity;

import com.iims.iims.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class ProgressTask {
    @Id
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "phase_id")
    private ProgressPhase phase;

    private String taskName;
    private String description;
    private Integer dueDays;
    private LocalDateTime dueDate;

    @ManyToOne
    @JoinColumn(name = "mentor_id")
    private User mentor;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ProgressPhase getPhase() { return phase; }
    public void setPhase(ProgressPhase phase) { this.phase = phase; }
    public String getTaskName() { return taskName; }
    public void setTaskName(String taskName) { this.taskName = taskName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDueDays() { return dueDays; }
    public void setDueDays(Integer dueDays) { this.dueDays = dueDays; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public User getMentor() { return mentor; }
    public void setMentor(User mentor) { this.mentor = mentor; }
} 