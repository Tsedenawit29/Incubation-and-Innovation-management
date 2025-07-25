package com.iims.iims.profile.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity; // Import ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.iims.iims.profile.dto.StartupProfileDto;
import com.iims.iims.profile.dto.StartupProfileUpdateRequest;
import com.iims.iims.profile.service.StartupProfileService;
import com.iims.iims.profile.exception.ProfileNotFoundException; // Import the new exception

@RestController
@RequestMapping("/api/profile/startup")
@CrossOrigin(origins = "http://localhost:3000")
public class StartupProfileController {
    private final StartupProfileService service;

    public StartupProfileController(StartupProfileService service) {
        this.service = service;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<StartupProfileDto> getProfile(@PathVariable UUID userId) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authenticated user: " + auth.getName() + ", roles: " + auth.getAuthorities());
        // The service layer will now throw ProfileNotFoundException, which Spring
        // will automatically map to a 404 due to @ResponseStatus.
        // So, we just return OK if successful.
        return ResponseEntity.ok(service.getProfileByUserId(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<StartupProfileDto> updateProfile(@PathVariable UUID userId, @RequestBody StartupProfileUpdateRequest req) {
        // Similar to getProfile, the service will handle NotFound.
        return ResponseEntity.ok(service.updateProfile(userId, req));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<StartupProfileDto> createProfile(@PathVariable UUID userId) {
        // Similar to getProfile, the service will handle NotFound if user doesn't exist.
        return ResponseEntity.ok(service.createProfile(userId));
    }
}