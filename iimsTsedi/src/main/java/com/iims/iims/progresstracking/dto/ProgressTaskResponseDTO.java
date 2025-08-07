package com.iims.iims.progresstracking.dto;

import java.util.UUID;
import java.time.LocalDateTime;

public class ProgressTaskResponseDTO {
    private UUID id;
    private UUID phaseId;
    private String taskName;
    private String description;
    private Integer dueDays;
    private LocalDateTime dueDate;
    private UUID mentorId;
    // getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPhaseId() { return phaseId; }
    public void setPhaseId(UUID phaseId) { this.phaseId = phaseId; }
    public String getTaskName() { return taskName; }
    public void setTaskName(String taskName) { this.taskName = taskName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDueDays() { return dueDays; }
    public void setDueDays(Integer dueDays) { this.dueDays = dueDays; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public UUID getMentorId() { return mentorId; }
    public void setMentorId(UUID mentorId) { this.mentorId = mentorId; }
} 