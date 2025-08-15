package com.iims.iims.profile.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.iims.iims.profile.dto.AlumniProfileDto;
import com.iims.iims.profile.dto.AlumniProfileUpdateRequest;
import com.iims.iims.profile.service.AlumniProfileService;

@RestController
@RequestMapping("/api/profile/alumni")
@CrossOrigin(origins = "http://localhost:3000")
public class AlumniProfileController {
    private final AlumniProfileService service;

    public AlumniProfileController(AlumniProfileService service) {
        this.service = service;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<AlumniProfileDto> getProfile(@PathVariable UUID userId) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authenticated user: " + auth.getName() + ", roles: " + auth.getAuthorities());
        return ResponseEntity.ok(service.getProfileByUserId(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<AlumniProfileDto> updateProfile(@PathVariable UUID userId, @RequestBody AlumniProfileUpdateRequest req) {
        return ResponseEntity.ok(service.updateProfile(userId, req));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<AlumniProfileDto> createProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(service.createProfile(userId));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteProfile(@PathVariable UUID userId) {
        service.deleteProfile(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<AlumniProfileDto>> getAllAlumni() {
        return ResponseEntity.ok(service.getAllAlumni());
    }

    @GetMapping("/search")
    public ResponseEntity<List<AlumniProfileDto>> searchAlumni(@RequestParam String query) {
        return ResponseEntity.ok(service.searchAlumni(query));
    }

    @GetMapping("/industry/{industry}")
    public ResponseEntity<List<AlumniProfileDto>> getAlumniByIndustry(@PathVariable String industry) {
        return ResponseEntity.ok(service.getAlumniByIndustry(industry));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getAlumniCount() {
        return ResponseEntity.ok(service.getAlumniCount());
    }
}
