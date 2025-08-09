package com.iims.iims.meeting.dto;

import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
public class MeetingRequestDto {
    private String title;
    private String description;
    private Instant startTime;
    private Instant endTime;
    private List<String> attendeeEmails; // emails of invited users (we will map to users)
}
