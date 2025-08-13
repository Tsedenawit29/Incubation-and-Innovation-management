package com.iims.iims.meeting.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class MeetingRequestDto {
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<UUID> attendeeIds; // IDs of system users to invite
    private List<String> attendeeEmails; // emails of external guests to invite
}
