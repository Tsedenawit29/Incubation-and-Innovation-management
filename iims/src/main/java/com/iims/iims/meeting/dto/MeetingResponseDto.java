package com.iims.iims.meeting.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class MeetingResponseDto {
    private UUID id;
    private String title;
    private String description;
    private Instant startTime;
    private Instant endTime;
    private String meetLink;
    private String googleEventOwner;
    private String googleEventId;
}

