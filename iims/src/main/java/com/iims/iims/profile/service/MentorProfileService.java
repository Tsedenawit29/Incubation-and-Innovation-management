package com.iims.iims.profile.service;

import com.iims.iims.profile.entity.MentorProfile;
import com.iims.iims.profile.entity.Expertise;
import com.iims.iims.profile.dto.MentorProfileDto;
import com.iims.iims.profile.dto.MentorProfileUpdateRequest;
import com.iims.iims.profile.dto.ExpertiseDto;
import com.iims.iims.profile.repository.MentorProfileRepository;
import com.iims.iims.profile.repository.ExpertiseRepository;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import com.iims.iims.profile.exception.ProfileNotFoundException; // Re-use the existing exception

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class for managing mentor profiles.
 * Handles the business logic for creating, retrieving, and updating mentor profiles.
 */
@Service
public class MentorProfileService {
    private final MentorProfileRepository profileRepo;
    private final UserRepository userRepo;
    private final ExpertiseRepository expertiseRepo;

    public MentorProfileService(MentorProfileRepository profileRepo, UserRepository userRepo, ExpertiseRepository expertiseRepo) {
        this.profileRepo = profileRepo;
        this.userRepo = userRepo;
        this.expertiseRepo = expertiseRepo;
    }

    /**
     * Retrieves a mentor profile by a user's ID.
     * @param userId The UUID of the user.
     * @return The MentorProfileDto.
     * @throws ProfileNotFoundException if the user or profile does not exist.
     */
    public MentorProfileDto getProfileByUserId(UUID userId) {
        userRepo.findById(userId)
                .orElseThrow(() -> new ProfileNotFoundException("User not found for ID: " + userId));
        MentorProfile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Mentor profile not found for user ID: " + userId));
        return toDto(profile);
    }

    /**
     * Updates an existing mentor profile.
     * @param userId The UUID of the user.
     * @param req The request DTO containing the updated profile data.
     * @return The updated MentorProfileDto.
     * @throws ProfileNotFoundException if the profile does not exist.
     */
    @Transactional
    public MentorProfileDto updateProfile(UUID userId, MentorProfileUpdateRequest req) {
        MentorProfile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Mentor profile not found for user ID: " + userId));

        // Update basic profile fields
        profile.setFirstName(req.getFirstName());
        profile.setLastName(req.getLastName());
        profile.setBio(req.getBio());
        profile.setTitle(req.getTitle());
        profile.setExperience(req.getExperience());
        profile.setLinkedin(req.getLinkedin());
        profile.setTwitter(req.getTwitter());
        profile.setAvatarUrl(req.getAvatarUrl());
        profile.setCountry(req.getCountry());
        profile.setCity(req.getCity());
        profile.setUpdatedAt(LocalDateTime.now()); // Update timestamp

        // --- Handle Expertise ---
        // Keep track of IDs from the request to determine which existing members to keep
        Set<UUID> requestedExpertiseIds = req.getExpertise() != null ?
                req.getExpertise().stream()
                        .filter(expReq -> expReq.getId() != null)
                        .map(expReq -> UUID.fromString(expReq.getId()))
                        .collect(Collectors.toSet()) :
                new HashSet<>();

        // Remove expertise items not present in the request
        profile.getExpertise().removeIf(existingExp -> {
            boolean shouldRemove = !requestedExpertiseIds.contains(existingExp.getId());
            return shouldRemove;
        });

        // Update existing or add new expertise items
        if (req.getExpertise() != null) {
            for (var expReq : req.getExpertise()) {
                if (expReq.getId() != null && requestedExpertiseIds.contains(UUID.fromString(expReq.getId()))) {
                    // Update existing expertise item
                    profile.getExpertise().stream()
                            .filter(existingExp -> existingExp.getId().equals(UUID.fromString(expReq.getId())))
                            .findFirst()
                            .ifPresent(existingExp -> {
                                existingExp.setExpertiseName(expReq.getExpertiseName());
                                existingExp.setDescription(expReq.getDescription());
                            });
                } else {
                    // Create new expertise item
                    Expertise newExp = Expertise.builder()
                            .expertiseName(expReq.getExpertiseName())
                            .description(expReq.getDescription())
                            .mentorProfile(profile) // Link to parent profile
                            .build();
                    profile.getExpertise().add(newExp); // Add to the managed collection
                }
            }
        }

        profileRepo.save(profile); // Save the main profile, cascading saves/updates/deletes
        return toDto(profile);
    }

    /**
     * Creates a new mentor profile for a user with default values.
     * @param userId The UUID of the user.
     * @return The newly created MentorProfileDto.
     * @throws ProfileNotFoundException if the user does not exist.
     */
    public MentorProfileDto createProfile(UUID userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ProfileNotFoundException("User not found for ID: " + userId));
        MentorProfile profile = MentorProfile.builder()
                .user(user)
                .firstName("New")
                .lastName("Mentor")
                .bio("")
                .title("")
                .experience("")
                .linkedin("")
                .twitter("")
                .avatarUrl("")
                .country("")
                .city("")
                .expertise(new ArrayList<>()) // Initialize empty list
                .createdAt(LocalDateTime.now()) // Set creation timestamp
                .updatedAt(LocalDateTime.now()) // Set initial update timestamp
                .build();
        profileRepo.save(profile);
        return toDto(profile);
    }

    /**
     * Converts a MentorProfile entity to its DTO representation.
     * @param profile The MentorProfile entity.
     * @return The MentorProfileDto.
     */
    private MentorProfileDto toDto(MentorProfile profile) {
        MentorProfileDto dto = new MentorProfileDto();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUser().getId());
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setBio(profile.getBio());
        dto.setTitle(profile.getTitle());
        dto.setExperience(profile.getExperience());
        dto.setLinkedin(profile.getLinkedin());
        dto.setTwitter(profile.getTwitter());
        dto.setAvatarUrl(profile.getAvatarUrl());
        dto.setCountry(profile.getCountry());
        dto.setCity(profile.getCity());

        // Map Expertise to DTOs
        dto.setExpertise(profile.getExpertise().stream()
                .map(this::toExpertiseDto)
                .collect(Collectors.toList()));

        return dto;
    }

    /**
     * Helper method to convert Expertise entity to DTO.
     * @param expertise The Expertise entity.
     * @return The ExpertiseDto.
     */
    private ExpertiseDto toExpertiseDto(Expertise expertise) {
        ExpertiseDto dto = new ExpertiseDto();
        dto.setId(expertise.getId() != null ? expertise.getId().toString() : null);
        dto.setExpertiseName(expertise.getExpertiseName());
        dto.setDescription(expertise.getDescription());
        return dto;
    }
}
