package com.iims.iims.meeting.controller;

import com.iims.iims.meeting.service.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/google")
@RequiredArgsConstructor
public class GoogleOAuthController {

    private final GoogleOAuthService googleOAuthService;

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
        // exchange code and save tokens
        googleOAuthService.handleCallback(code, state);
        // redirect to frontend or send success message
        return ResponseEntity.ok("Google account linked successfully");
    }
}
