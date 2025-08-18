package com.iims.iims.profile.service;

import com.iims.iims.profile.entity.StartupProfile;
import com.iims.iims.profile.entity.TeamMember;
import com.iims.iims.profile.entity.Document;
import com.iims.iims.profile.dto.StartupProfileDto;
import com.iims.iims.profile.dto.StartupProfileUpdateRequest;
import com.iims.iims.profile.dto.TeamMemberDto;
import com.iims.iims.profile.dto.DocumentDto;
import com.iims.iims.profile.repository.StartupProfileRepository;
import com.iims.iims.profile.repository.TeamMemberRepository;
import com.iims.iims.profile.repository.DocumentRepository;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import com.iims.iims.profile.exception.ProfileNotFoundException; // Import the new exception

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StartupProfileService {
    private final StartupProfileRepository profileRepo;
    private final UserRepository userRepo;
    private final TeamMemberRepository teamMemberRepo;
    private final DocumentRepository documentRepo;

    public StartupProfileService(StartupProfileRepository profileRepo, UserRepository userRepo,
                                 TeamMemberRepository teamMemberRepo, DocumentRepository documentRepo) {
        this.profileRepo = profileRepo;
        this.userRepo = userRepo;
        this.teamMemberRepo = teamMemberRepo;
        this.documentRepo = documentRepo;
    }

    public StartupProfileDto getProfileByUserId(UUID userId) {
        // First, ensure the user exists
        userRepo.findById(userId)
                .orElseThrow(() -> new ProfileNotFoundException("User not found for ID: " + userId));

        // Then, try to find the profile for that user
        StartupProfile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user ID: " + userId));
        return toDto(profile);
    }

    @Transactional
    public StartupProfileDto updateProfile(UUID userId, StartupProfileUpdateRequest req) {
        StartupProfile profile = profileRepo.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user ID: " + userId));

        // Update basic profile fields
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
        profile.setIndustry(req.getIndustry());
        profile.setCountry(req.getCountry());
        profile.setCity(req.getCity());
        profile.setUpdatedAt(LocalDateTime.now()); // Update timestamp

        // --- Handle Team Members ---
        // Keep track of IDs from the request to determine which existing members to keep
        Set<UUID> requestedTeamMemberIds = req.getTeamMembers() != null ?
                req.getTeamMembers().stream()
                        .filter(tmReq -> tmReq.getId() != null)
                        .map(tmReq -> UUID.fromString(tmReq.getId())) // Convert String ID to UUID
                        .collect(Collectors.toSet()) :
                new HashSet<>();

        // Remove team members not present in the request
        profile.getTeamMembers().removeIf(existingTm -> {
            boolean shouldRemove = !requestedTeamMemberIds.contains(existingTm.getId());
            if (shouldRemove) {
                // If orphanRemoval is true on the @OneToMany, Hibernate handles deletion.
                // If not, you might need teamMemberRepo.delete(existingTm); here
                // but generally with orphanRemoval=true, just removing from collection is enough.
            }
            return shouldRemove;
        });

        // Update existing or add new team members
        if (req.getTeamMembers() != null) {
            for (var tmReq : req.getTeamMembers()) {
                if (tmReq.getId() != null && requestedTeamMemberIds.contains(UUID.fromString(tmReq.getId()))) {
                    // Update existing team member
                    // Find the existing member in the managed collection
                    profile.getTeamMembers().stream()
                            .filter(existingTm -> existingTm.getId().equals(UUID.fromString(tmReq.getId())))
                            .findFirst()
                            .ifPresent(existingTm -> {
                                existingTm.setName(tmReq.getName());
                                existingTm.setRole(tmReq.getRole());
                                existingTm.setLinkedin(tmReq.getLinkedin());
                                existingTm.setAvatarUrl(tmReq.getAvatarUrl());
                            });
                } else {
                    // Create new team member (ID is null or not found in existing)
                    TeamMember newTm = TeamMember.builder()
                            .name(tmReq.getName())
                            .role(tmReq.getRole())
                            .linkedin(tmReq.getLinkedin())
                            .avatarUrl(tmReq.getAvatarUrl())
                            .startupProfile(profile) // Link to parent profile
                            .build();
                    profile.getTeamMembers().add(newTm); // Add to the managed collection
                }
            }
        }

        // --- Handle Documents ---
        // Keep track of IDs from the request to determine which existing documents to keep
        Set<UUID> requestedDocumentIds = req.getDocuments() != null ?
                req.getDocuments().stream()
                        .filter(docReq -> docReq.getId() != null)
                        .map(docReq -> UUID.fromString(docReq.getId())) // Convert String ID to UUID
                        .collect(Collectors.toSet()) :
                new HashSet<>();

        // Remove documents not present in the request
        profile.getDocuments().removeIf(existingDoc -> {
            boolean shouldRemove = !requestedDocumentIds.contains(existingDoc.getId());
            if (shouldRemove) {
                // Similar to team members, Hibernate handles deletion if orphanRemoval is true.
            }
            return shouldRemove;
        });

        // Update existing or add new documents
        if (req.getDocuments() != null) {
            for (var docReq : req.getDocuments()) {
                if (docReq.getId() != null && requestedDocumentIds.contains(UUID.fromString(docReq.getId()))) {
                    // Update existing document
                    profile.getDocuments().stream()
                            .filter(existingDoc -> existingDoc.getId().equals(UUID.fromString(docReq.getId())))
                            .findFirst()
                            .ifPresent(existingDoc -> {
                                existingDoc.setName(docReq.getName());
                                existingDoc.setUrl(docReq.getUrl());
                                existingDoc.setFileType(docReq.getFileType());
                            });
                } else {
                    // Create new document (ID is null or not found in existing)
                    Document newDoc = Document.builder()
                            .name(docReq.getName())
                            .url(docReq.getUrl())
                            .fileType(docReq.getFileType())
                            .startupProfile(profile) // Link to parent profile
                            .build();
                    profile.getDocuments().add(newDoc); // Add to the managed collection
                }
            }
        }

        profileRepo.save(profile); // Save the main profile, cascading saves/updates/deletes
        return toDto(profile);
    }

    public StartupProfileDto createProfile(UUID userId) {
        // If profile already exists for this user, return it (idempotent behavior)
        var existing = profileRepo.findByUserId(userId);
        if (existing.isPresent()) {
            return toDto(existing.get());
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ProfileNotFoundException("User not found for ID: " + userId)); // Use custom exception
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
                .industry("")
                .country("")
                .city("")
                .teamMembers(new ArrayList<>()) // Initialize empty list
                .documents(new ArrayList<>())   // Initialize empty list
                .createdAt(LocalDateTime.now()) // Set creation timestamp
                .updatedAt(LocalDateTime.now()) // Set initial update timestamp
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

        // Map Team Members to DTOs
        dto.setTeamMembers(profile.getTeamMembers().stream()
                .map(this::toTeamMemberDto)
                .collect(Collectors.toList()));

        // Map Documents to DTOs
        dto.setDocuments(profile.getDocuments().stream()
                .map(this::toDocumentDto)
                .collect(Collectors.toList()));

        return dto;
    }

    // Helper method to convert TeamMember entity to DTO
    private TeamMemberDto toTeamMemberDto(TeamMember teamMember) {
        TeamMemberDto dto = new TeamMemberDto();
        dto.setId(teamMember.getId() != null ? teamMember.getId().toString() : null); // Convert UUID to String
        dto.setName(teamMember.getName());
        dto.setRole(teamMember.getRole());
        dto.setLinkedin(teamMember.getLinkedin());
        dto.setAvatarUrl(teamMember.getAvatarUrl());
        return dto;
    }

    // Helper method to convert Document entity to DTO
    private DocumentDto toDocumentDto(Document document) {
        DocumentDto dto = new DocumentDto();
        dto.setId(document.getId() != null ? document.getId().toString() : null); // Convert UUID to String
        dto.setName(document.getName());
        dto.setUrl(document.getUrl());
        dto.setFileType(document.getFileType());
        return dto;
    }
}
