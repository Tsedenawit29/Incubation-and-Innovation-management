package com.iims.iims.meeting.service;

import com.iims.iims.meeting.dto.MeetingRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleCalendarService {

      private final RestTemplate restTemplate;

    /**
     * Create event using Google Calendar REST API with conferenceData (meet)
     * Returns a Map representation of the created event (you can extract meet link)
     */
    public Map<String, Object> createEvent(String accessToken, MeetingRequestDto dto, List<String> allAttendeeEmails) {
        String url = "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all";
        
        log.info("Creating Google Calendar event: {}", dto.getTitle());
        log.info("Attendee emails: {}", allAttendeeEmails);
        log.info("Start time: {}, End time: {}", dto.getStartTime(), dto.getEndTime());
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);
        
        // Convert LocalDateTime to ISO format for Google Calendar API
        String startTimeISO = dto.getStartTime().toString() + ":00";
        String endTimeISO = dto.getEndTime().toString() + ":00";
        
        log.info("Formatted times - Start: {}, End: {}", startTimeISO, endTimeISO);
        
        // Build event data
        Map<String, Object> event = new HashMap<>();
        event.put("summary", dto.getTitle());
        event.put("description", dto.getDescription());
        
        // Start time
        Map<String, Object> start = new HashMap<>();
        start.put("dateTime", startTimeISO);
        start.put("timeZone", "UTC");
        event.put("start", start);
        
        // End time
        Map<String, Object> end = new HashMap<>();
        end.put("dateTime", endTimeISO);
        end.put("timeZone", "UTC");
        event.put("end", end);

        // Include all attendee emails (both system users and guests)
        if (allAttendeeEmails != null && !allAttendeeEmails.isEmpty()) {
            List<Map<String,String>> attendees = new ArrayList<>();
            allAttendeeEmails.forEach(email -> attendees.add(Map.of("email", email)));
            event.put("attendees", attendees);
            log.info("Added {} attendees to event", attendees.size());
        } else {
            log.warn("No attendees provided for event");
        }

        // conferenceData.createRequest
        Map<String,Object> createReq = Map.of("requestId", UUID.randomUUID().toString());
        event.put("conferenceData", Map.of("createRequest", createReq));

        log.info("Sending event to Google Calendar API: {}", event);
        
        HttpEntity<Map<String,Object>> req = new HttpEntity<>(event, headers);
        ResponseEntity<Map> resp = restTemplate.postForEntity(url, req, Map.class);

        if (!resp.getStatusCode().is2xxSuccessful()) {
            log.error("Failed to create Google Calendar event. Status: {}, Response: {}", resp.getStatusCode(), resp.getBody());
            throw new RuntimeException("Failed to create google event: " + resp.getStatusCode());
        }
        
        log.info("Successfully created Google Calendar event. Response: {}", resp.getBody());
        // resp body contains conferenceData and entryPoints (meet link)
        return resp.getBody();
    }

    /**
     * Parse meet link from event response (conferenceData.entryPoints)
     */
    @SuppressWarnings("unchecked")
    public String extractMeetLink(Map<String, Object> eventResponse) {
        if (eventResponse == null) return null;
        Map<String, Object> conferenceData = (Map<String, Object>) eventResponse.get("conferenceData");
        if (conferenceData == null) return null;
        List<Map<String,Object>> entryPoints = (List<Map<String,Object>>) conferenceData.get("entryPoints");
        if (entryPoints == null) return null;
        for (Map<String,Object> ep : entryPoints) {
            String type = (String) ep.get("entryPointType");
            if ("video".equalsIgnoreCase(type) || "video".equalsIgnoreCase((String) ep.get("entryPointType"))) {
                return (String) ep.get("uri");
            }
        }
        return null;
    }

    /**
     * Get events from Google Calendar for a given time range
     */
    public Map<String, Object> getEvents(String accessToken, Instant startTime, Instant endTime) {
        String url = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Build query parameters
        String queryParams = String.format("?timeMin=%s&timeMax=%s&singleEvents=true&orderBy=startTime",
                startTime.toString(),
                endTime.toString());

        String fullUrl = url + queryParams;
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(fullUrl, HttpMethod.GET, entity, Map.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Failed to fetch Google Calendar events: " + response.getStatusCode());
        }

        return response.getBody();
    }
}
