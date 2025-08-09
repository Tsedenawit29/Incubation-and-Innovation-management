package com.iims.iims.meeting.controller;

import com.iims.iims.meeting.dto.MeetingRequestDto;
import com.iims.iims.meeting.dto.MeetingResponseDto;
import com.iims.iims.meeting.entity.Meeting;
import com.iims.iims.meeting.service.MeetingService;
import com.iims.iims.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<MeetingResponseDto> createMeeting(Authentication auth,
                                                            @RequestBody MeetingRequestDto dto) {
        // Get user id from authenticated principal (your JWT contains email)
        String email = auth.getName();
        UUID userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        Meeting meeting = meetingService.createMeeting(userId, dto);

        MeetingResponseDto resp = MeetingResponseDto.builder()
                .id(meeting.getId())
                .title(meeting.getTitle())
                .description(meeting.getDescription())
                .startTime(meeting.getStartTime())
                .endTime(meeting.getEndTime())
                .meetLink(meeting.getMeetLink())
                .googleEventOwner(meeting.getGoogleEventOwner())
                .googleEventId(meeting.getGoogleEventId())
                .build();

        return ResponseEntity.ok(resp);
    }
}
