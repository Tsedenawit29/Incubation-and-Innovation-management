package com.iims.iims.mentorassignment.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class StartupMentorAssignmentResponseDTO {
    private UUID id;
    private UserSummaryDTO startup;
    private UserSummaryDTO mentor;
    private LocalDateTime assignedAt;
} 