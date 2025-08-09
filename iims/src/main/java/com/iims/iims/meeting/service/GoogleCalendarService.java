package com.iims.iims.meeting.service;

import com.iims.iims.meeting.dto.MeetingRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.*;

@RequiredArgsConstructor
public class GoogleCalendarService {

      private final RestTemplate restTemplate;

    /**
     * Create event using Google Calendar REST API with conferenceData (meet)
     * Returns a Map representation of the created event (you can extract meet link)
     */
    public Map<String, Object> createEvent(String accessToken, MeetingRequestDto dto) {
        String url = "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> event = new HashMap<>();
        event.put("summary", dto.getTitle());
        event.put("description", dto.getDescription());

        Map<String, Object> start = Map.of("dateTime", dto.getStartTime().toString());
        Map<String, Object> end = Map.of("dateTime", dto.getEndTime().toString());
        event.put("start", start);
        event.put("end", end);

        if (dto.getAttendeeEmails() != null && !dto.getAttendeeEmails().isEmpty()) {
            List<Map<String,String>> attendees = new ArrayList<>();
            dto.getAttendeeEmails().forEach(e -> attendees.add(Map.of("email", e)));
            event.put("attendees", attendees);
        }

        // conferenceData.createRequest
        Map<String,Object> createReq = Map.of("requestId", UUID.randomUUID().toString());
        event.put("conferenceData", Map.of("createRequest", createReq));

        HttpEntity<Map<String,Object>> req = new HttpEntity<>(event, headers);
        ResponseEntity<Map> resp = restTemplate.postForEntity(url, req, Map.class);

        if (!resp.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Failed to create google event: " + resp.getStatusCode());
        }
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
}
