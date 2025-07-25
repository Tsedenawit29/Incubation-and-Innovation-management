package com.iims.iims.profile.service;

import com.iims.iims.profile.entity.StartupProfile;
import com.iims.iims.profile.dto.StartupProfileDto;
import com.iims.iims.profile.dto.StartupProfileUpdateRequest;
import com.iims.iims.profile.repository.StartupProfileRepository;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class StartupProfileService {
    private final StartupProfileRepository profileRepo;
    private final UserRepository userRepo;

    public StartupProfileService(StartupProfileRepository profileRepo, UserRepository userRepo) {
        this.profileRepo = profileRepo;
        this.userRepo = userRepo;
    }

    public StartupProfileDto getProfileByUserId(UUID userId) {
        StartupProfile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return toDto(profile);
    }

    public StartupProfileDto updateProfile(UUID userId, StartupProfileUpdateRequest req) {
        StartupProfile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        profile.setStartupName(req.getStartupName());
        profile.setDescription(req.getDescription());
        profile.setWebsite(req.getWebsite());
        profile.setPhone(req.getPhone());
        profile.setAddress(req.getAddress());
        profile.setLinkedin(req.getLinkedin());
        profile.setTwitter(req.getTwitter());
        profile.setLogoUrl(req.getLogoUrl());
        profile.setMission(req.getMission());
        profile.setVision(req.getVision());
        // Set new fields
        profile.setIndustry(req.getIndustry());
        profile.setCountry(req.getCountry());
        profile.setCity(req.getCity());

        profileRepo.save(profile);
        return toDto(profile);
    }

    public StartupProfileDto createProfile(UUID userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        StartupProfile profile = StartupProfile.builder()
                .user(user)
                .startupName("New Startup")
                .description("")
                .website("")
                .phone("")
                .address("")
                .linkedin("")
                .twitter("")
                .logoUrl("")
                .mission("")
                .vision("")
                // Initialize new fields
                .industry("")
                .country("")
                .city("")
                .build();
        profileRepo.save(profile);
        return toDto(profile);
    }

    private StartupProfileDto toDto(StartupProfile profile) {
        StartupProfileDto dto = new StartupProfileDto();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUser().getId());
        dto.setStartupName(profile.getStartupName());
        dto.setDescription(profile.getDescription());
        dto.setWebsite(profile.getWebsite());
        dto.setPhone(profile.getPhone());
        dto.setAddress(profile.getAddress());
        dto.setLinkedin(profile.getLinkedin());
        dto.setTwitter(profile.getTwitter());
        dto.setLogoUrl(profile.getLogoUrl());
        dto.setMission(profile.getMission());
        dto.setVision(profile.getVision());
        dto.setIndustry(profile.getIndustry());
        dto.setCountry(profile.getCountry());
        dto.setCity(profile.getCity());
        return dto;
    }
}