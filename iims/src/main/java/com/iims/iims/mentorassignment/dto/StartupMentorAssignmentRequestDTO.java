package com.iims.iims.mentorassignment.dto;

import java.util.UUID;

public class StartupMentorAssignmentRequestDTO {
    private UUID startupId;
    private UUID mentorId;
    // getters and setters
    public UUID getStartupId() { return startupId; }
    public void setStartupId(UUID startupId) { this.startupId = startupId; }
    public UUID getMentorId() { return mentorId; }
    public void setMentorId(UUID mentorId) { this.mentorId = mentorId; }
} 