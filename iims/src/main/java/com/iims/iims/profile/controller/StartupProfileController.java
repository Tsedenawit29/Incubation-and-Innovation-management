package com.iims.iims.profile.controller;

import java.util.UUID;

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

@RestController
@RequestMapping("/api/profile/startup")
@CrossOrigin(origins = "http://localhost:3000") 
public class StartupProfileController {
    private final StartupProfileService service;

    public StartupProfileController(StartupProfileService service) {
        this.service = service;
    }

    @GetMapping("/{userId}")
    public StartupProfileDto getProfile(@PathVariable UUID userId) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authenticated user: " + auth.getName() + ", roles: " + auth.getAuthorities());
        return service.getProfileByUserId(userId);
    }

    @PutMapping("/{userId}")
    public StartupProfileDto updateProfile(@PathVariable UUID userId, @RequestBody StartupProfileUpdateRequest req) {
        return service.updateProfile(userId, req);
    }

    @PostMapping("/{userId}")
    public StartupProfileDto createProfile(@PathVariable UUID userId) {
        return service.createProfile(userId);
    }
}