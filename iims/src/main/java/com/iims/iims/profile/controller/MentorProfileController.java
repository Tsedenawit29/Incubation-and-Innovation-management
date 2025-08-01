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

import com.iims.iims.profile.dto.MentorProfileDto;
import com.iims.iims.profile.dto.MentorProfileUpdateRequest;
import com.iims.iims.profile.service.MentorProfileService;
import com.iims.iims.profile.exception.ProfileNotFoundException; // Re-use the existing exception

/**
 * REST Controller for managing mentor profiles.
 * Provides endpoints for creating, retrieving, and updating mentor profiles.
 */
@RestController
@RequestMapping("/api/profile/mentor")
@CrossOrigin(origins = "http://localhost:3000")
public class MentorProfileController {
    private final MentorProfileService service;

    public MentorProfileController(MentorProfileService service) {
        this.service = service;
    }

    /**
     * Retrieves a mentor profile by the user ID.
     * @param userId The UUID of the user associated with the profile.
     * @return A ResponseEntity containing the MentorProfileDto.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<MentorProfileDto> getProfile(@PathVariable UUID userId) {
        // The service layer will throw ProfileNotFoundException if the user or profile is not found.
        // Spring will automatically handle this exception and return a 404 response.
        return ResponseEntity.ok(service.getProfileByUserId(userId));
    }

    /**
     * Updates an existing mentor profile.
     * @param userId The UUID of the user.
     * @param req The MentorProfileUpdateRequest DTO containing the updated profile data.
     * @return A ResponseEntity containing the updated MentorProfileDto.
     */
    @PutMapping("/{userId}")
    public ResponseEntity<MentorProfileDto> updateProfile(@PathVariable UUID userId, @RequestBody MentorProfileUpdateRequest req) {
        return ResponseEntity.ok(service.updateProfile(userId, req));
    }

    /**
     * Creates a new mentor profile for a user.
     * @param userId The UUID of the user to create the profile for.
     * @return A ResponseEntity containing the newly created MentorProfileDto.
     */
    @PostMapping("/{userId}")
    public ResponseEntity<MentorProfileDto> createProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(service.createProfile(userId));
    }
}
