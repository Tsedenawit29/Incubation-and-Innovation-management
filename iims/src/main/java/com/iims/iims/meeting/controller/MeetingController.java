package com.iims.iims.meeting.controller;

import com.iims.iims.meeting.dto.MeetingRequestDto;
import com.iims.iims.meeting.dto.MeetingResponseDto;
import com.iims.iims.meeting.entity.Meeting;
import com.iims.iims.meeting.service.MeetingService;
import com.iims.iims.meeting.service.GoogleOAuthService;
import com.iims.iims.meeting.entity.GoogleOAuthToken;
import com.iims.iims.meeting.repository.GoogleOAuthTokenRepository;
import com.iims.iims.user.repository.UserRepository;
import com.iims.iims.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;
    private final UserRepository userRepository;
    private final GoogleOAuthTokenRepository googleOAuthTokenRepository;

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

    @GetMapping("/my-meetings")
    public ResponseEntity<List<MeetingResponseDto>> getMyMeetings(Authentication auth) {
        String email = auth.getName();
        UUID userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        List<Meeting> meetings = meetingService.getMeetingsByOrganizer(userId);
        
        List<MeetingResponseDto> response = meetings.stream()
                .map(meeting -> MeetingResponseDto.builder()
                        .id(meeting.getId())
                        .title(meeting.getTitle())
                        .description(meeting.getDescription())
                        .startTime(meeting.getStartTime())
                        .endTime(meeting.getEndTime())
                        .meetLink(meeting.getMeetLink())
                        .googleEventOwner(meeting.getGoogleEventOwner())
                        .googleEventId(meeting.getGoogleEventId())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/oauth-status")
    public ResponseEntity<Object> getOAuthStatus(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UUID userId = user.getId();

        // First check for user token
        Optional<GoogleOAuthToken> userToken = googleOAuthTokenRepository.findByUserId(userId);
        
        if (userToken.isPresent()) {
            GoogleOAuthToken token = userToken.get();
            return ResponseEntity.ok(Map.of(
                "connected", true,
                "expiresAt", token.getExpiryTime(),
                "scope", token.getScope()
            ));
        }
        
        // If no user token found, check for tenant token (for tenant admin users)
        if ("TENANT_ADMIN".equals(user.getRole().toString())) {
            Optional<GoogleOAuthToken> tenantToken = googleOAuthTokenRepository.findByTenantId(user.getTenantId());
            if (tenantToken.isPresent()) {
                GoogleOAuthToken token = tenantToken.get();
                return ResponseEntity.ok(Map.of(
                    "connected", true,
                    "expiresAt", token.getExpiryTime(),
                    "scope", token.getScope()
                ));
            }
        }
        
        return ResponseEntity.ok(Map.of("connected", false));
    }

    @DeleteMapping("/{meetingId}")
    public ResponseEntity<Void> deleteMeeting(Authentication auth, @PathVariable UUID meetingId) {
        String email = auth.getName();
        UUID userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        meetingService.deleteMeeting(meetingId, userId);
        return ResponseEntity.noContent().build();
    }
}
