package com.iims.iims.meeting.controller;

import com.iims.iims.meeting.service.GoogleOAuthService;
import com.iims.iims.meeting.service.GoogleCalendarService;
import com.iims.iims.meeting.entity.GoogleOAuthToken;
import com.iims.iims.meeting.repository.GoogleOAuthTokenRepository;
import com.iims.iims.user.repository.UserRepository;
import com.iims.iims.user.entity.User;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/google")
@RequiredArgsConstructor
public class GoogleOAuthController {

    private final GoogleOAuthService googleOAuthService;
    private final GoogleCalendarService googleCalendarService;
    private final GoogleOAuthTokenRepository googleOAuthTokenRepository;
    private final UserRepository userRepository;

    @GetMapping("/auth-url")
    public ResponseEntity<String> getAuthUrl(@RequestParam String type, @RequestParam UUID id) {
        // type = "user" or "tenant"
        // stateNonce should be a secure random string or HMAC including caller info; simplified here
        String stateNonce = UUID.randomUUID().toString();
        String url = googleOAuthService.buildAuthorizationUrl(type, id, stateNonce);
        return ResponseEntity.ok(url);
    }

    @GetMapping("/callback")
    public ResponseEntity<String> callback(@RequestParam String code, @RequestParam String state) {
        try {
            googleOAuthService.handleCallback(code, state);
            
            // Return HTML that will redirect to the React success page with success status
            String html = "<!DOCTYPE html>" +
                "<html><head><title>OAuth Success</title></head>" +
                "<body>" +
                "<script>" +
                "setTimeout(function() {" +
                "window.location.href = 'http://localhost:3000/google-oauth-success?status=success&state=" + state + "';" +
                "}, 1000);" +
                "</script>" +
                "<div style='text-align:center; font-family:Arial; padding:50px;'>" +
                "<h2>✅ Google Calendar Connected Successfully!</h2>" +
                "<p>Redirecting you back to the calendar...</p>" +
                "</div>" +
                "</body></html>";
            
            return ResponseEntity.ok()
                .header("Content-Type", "text/html")
                .body(html);
            
        } catch (Exception e) {
            e.printStackTrace();
            
            String errorHtml = "<!DOCTYPE html>" +
                "<html><head><title>OAuth Error</title></head>" +
                "<body>" +
                "<script>" +
                "setTimeout(function() {" +
                "window.location.href = 'http://localhost:3000/google-oauth-success?status=error&error=" + 
                java.net.URLEncoder.encode(e.getMessage(), java.nio.charset.StandardCharsets.UTF_8) + "';" +
                "}, 3000);" +
                "</script>" +
                "<div style='text-align:center; font-family:Arial; padding:50px;'>" +
                "<h2>❌ Connection Failed</h2>" +
                "<p>" + e.getMessage() + "</p>" +
                "<p>Redirecting you back...</p>" +
                "</div>" +
                "</body></html>";
            
            return ResponseEntity.status(500)
                .header("Content-Type", "text/html")
                .body(errorHtml);
        }
    }

    @GetMapping("/calendar/events")
    public ResponseEntity<Object> getCalendarEvents(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UUID userId = user.getId();

        // First check for user token
        Optional<GoogleOAuthToken> userToken = googleOAuthTokenRepository.findByUserId(userId);
        GoogleOAuthToken token = null;
        
        if (userToken.isPresent()) {
            token = userToken.get();
        } else if ("TENANT_ADMIN".equals(user.getRole().toString())) {
            // If no user token found, check for tenant token (for tenant admin users)
            Optional<GoogleOAuthToken> tenantToken = googleOAuthTokenRepository.findByTenantId(user.getTenantId());
            if (tenantToken.isPresent()) {
                token = tenantToken.get();
            }
        }
        
        if (token == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Google account not connected"));
        }
        
        // Refresh token if needed
        if (token.getExpiryTime() == null || token.getExpiryTime().isBefore(Instant.now().plusSeconds(60))) {
            googleOAuthService.refreshAccessToken(token);
        }

        try {
            // Get events for next 30 days
            Instant now = Instant.now();
            Instant endTime = now.plus(30, ChronoUnit.DAYS);
            
            Map<String, Object> events = googleCalendarService.getEvents(
                token.getAccessToken(), 
                now, 
                endTime
            );
            
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
