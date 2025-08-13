package com.iims.iims.meeting.service;

import com.iims.iims.meeting.dto.MeetingRequestDto;
import com.iims.iims.meeting.entity.GoogleOAuthToken;
import com.iims.iims.meeting.entity.Meeting;
import com.iims.iims.meeting.repository.GoogleOAuthTokenRepository;
import com.iims.iims.meeting.repository.MeetingRepository;
import com.iims.iims.meeting.service.GoogleCalendarService;
// import com.iims.iims.meeting.util.TokenEncryptor; // Temporarily disabled
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.ZoneOffset;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepo;
    private final UserRepository userRepo;
    private final GoogleOAuthTokenRepository tokenRepo;
    private final GoogleCalendarService calendarService;
    private final GoogleOAuthService oauthService; // for refreshing tokens
    // private final TokenEncryptor encryptor; // Temporarily disabled

    @Transactional
    public Meeting createMeeting(UUID organizerId, MeetingRequestDto dto) {
        User organizer = userRepo.findById(organizerId).orElseThrow(() -> new RuntimeException("Organizer not found"));

        // Resolve attendees and collect all emails for Google Calendar
        List<User> attendees = resolveAttendees(dto.getAttendeeIds(), dto.getAttendeeEmails());
        List<String> allAttendeeEmails = new ArrayList<>();
        
        // Add system user emails
        attendees.forEach(user -> allAttendeeEmails.add(user.getEmail()));
        
        // Add guest emails
        if (dto.getAttendeeEmails() != null) {
            allAttendeeEmails.addAll(dto.getAttendeeEmails());
        }
// Convert LocalDateTime (which frontend already sent as UTC) directly to Instant
Instant startTimeInstant = dto.getStartTime().toInstant(ZoneOffset.UTC);
Instant endTimeInstant = dto.getEndTime().toInstant(ZoneOffset.UTC);

        // Save a basic meeting record first (optional) or perform after creating event
        Meeting meeting = Meeting.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .startTime(startTimeInstant)
                .endTime(endTimeInstant)
                .organizer(organizer)
                .attendees(attendees)
                .build();

        // Try user-level token
        Optional<GoogleOAuthToken> userTokenOpt = tokenRepo.findByUserId(organizer.getId());
        Map<String,Object> eventResponse = null;
        String ownerTag = null;

        if (userTokenOpt.isPresent()) {
            GoogleOAuthToken userToken = userTokenOpt.get();
            try {
                // refresh if necessary
                if (userToken.getExpiryTime() == null || userToken.getExpiryTime().isBefore(Instant.now().plusSeconds(60))) {
                    oauthService.refreshAccessToken(userToken);
                }
                eventResponse = calendarService.createEvent(userToken.getAccessToken(), dto, allAttendeeEmails);
                ownerTag = "user:" + organizer.getId();
            } catch (Exception e) {
                // log and fallback
                e.printStackTrace();
            }
        }

        // Fallback to tenant token if user not available or failed
        if (eventResponse == null) {
            UUID tenantId = organizer.getTenantId();
            if (tenantId != null) {
                Optional<GoogleOAuthToken> tenantTokenOpt = tokenRepo.findByTenantId(tenantId);
                if (tenantTokenOpt.isPresent()) {
                    GoogleOAuthToken t = tenantTokenOpt.get();
                    oauthService.refreshAccessToken(t);
                    eventResponse = calendarService.createEvent(t.getAccessToken(), dto, allAttendeeEmails);
                    ownerTag = "tenant:" + tenantId;
                }
            }
        }

        if (eventResponse == null) {
            throw new RuntimeException("Failed to create event with user and tenant tokens");
        }

        // Extract meet link and event id
        String meetLink = calendarService.extractMeetLink(eventResponse);
        String eventId = (String) eventResponse.get("id");

        meeting.setMeetLink(meetLink);
        meeting.setGoogleEventId(eventId);
        meeting.setGoogleEventOwner(ownerTag);

        return meetingRepo.save(meeting);
    }

    private List<User> resolveAttendees(List<UUID> attendeeIds, List<String> attendeeEmails) {
        List<User> attendees = new ArrayList<>();
        
        // Add users by ID (system users)
        if (attendeeIds != null && !attendeeIds.isEmpty()) {
            List<User> systemUsers = userRepo.findAllById(attendeeIds);
            attendees.addAll(systemUsers);
        }
        
        // Add users by email (for guest emails that might match existing users)
        if (attendeeEmails != null && !attendeeEmails.isEmpty()) {
            List<User> emailUsers = attendeeEmails.stream()
                    .map(email -> userRepo.findByEmail(email).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            attendees.addAll(emailUsers);
        }
        
        return attendees;
    }

    /**
     * Get meetings organized by a specific user
     */
    public List<Meeting> getMeetingsByOrganizer(UUID organizerId) {
        User organizer = userRepo.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
        return meetingRepo.findByOrganizer(organizer);
    }

    /**
     * Delete a meeting (only by organizer)
     */
    @Transactional
    public void deleteMeeting(UUID meetingId, UUID userId) {
        Meeting meeting = meetingRepo.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        
        if (!meeting.getOrganizer().getId().equals(userId)) {
            throw new RuntimeException("Only the organizer can delete this meeting");
        }

        // TODO: Delete from Google Calendar if needed
        // For now, just delete from local database
        meetingRepo.delete(meeting);
    }
}
