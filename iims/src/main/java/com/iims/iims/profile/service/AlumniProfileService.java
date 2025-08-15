package com.iims.iims.profile.service;

import com.iims.iims.profile.dto.AlumniProfileDto;
import com.iims.iims.profile.dto.AlumniProfileUpdateRequest;
import com.iims.iims.profile.entity.AlumniProfile;
import com.iims.iims.profile.repository.AlumniProfileRepository;
import com.iims.iims.profile.exception.ProfileNotFoundException;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AlumniProfileService {
    private final AlumniProfileRepository alumniProfileRepository;
    private final UserRepository userRepository;

    public AlumniProfileService(AlumniProfileRepository alumniProfileRepository, UserRepository userRepository) {
        this.alumniProfileRepository = alumniProfileRepository;
        this.userRepository = userRepository;
    }

    public AlumniProfileDto getProfileByUserId(UUID userId) {
        AlumniProfile profile = alumniProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Create a basic profile if it doesn't exist
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ProfileNotFoundException("User not found with ID: " + userId));
                    
                    return AlumniProfile.builder()
                            .user(user)
                            .firstName(user.getFullName() != null ? user.getFullName().split(" ")[0] : "")
                            .lastName(user.getFullName() != null && user.getFullName().split(" ").length > 1 ? 
                                     user.getFullName().split(" ")[1] : "")
                            .isActive(true)
                            .build();
                });
        return convertToDto(profile);
    }

    @Transactional
    public AlumniProfileDto createProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ProfileNotFoundException("User not found with ID: " + userId));

        if (alumniProfileRepository.findByUserId(userId).isPresent()) {
            throw new IllegalStateException("Alumni profile already exists for user ID: " + userId);
        }

        AlumniProfile profile = AlumniProfile.builder()
                .user(user)
                .firstName(user.getFullName() != null ? user.getFullName().split(" ")[0] : "")
                .lastName(user.getFullName() != null && user.getFullName().split(" ").length > 1 ? 
                         user.getFullName().split(" ")[1] : "")
                .build();

        AlumniProfile savedProfile = alumniProfileRepository.save(profile);
        return convertToDto(savedProfile);
    }

    @Transactional
    public AlumniProfileDto updateProfile(UUID userId, AlumniProfileUpdateRequest request) {
        // Try to find existing profile, if not found, create a new one
        AlumniProfile profile = alumniProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Create new profile if it doesn't exist
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ProfileNotFoundException("User not found with ID: " + userId));
                    
                    return AlumniProfile.builder()
                            .user(user)
                            .firstName(user.getFullName() != null ? user.getFullName().split(" ")[0] : "")
                            .lastName(user.getFullName() != null && user.getFullName().split(" ").length > 1 ? 
                                     user.getFullName().split(" ")[1] : "")
                            .build();
                });

        updateProfileFromRequest(profile, request);
        AlumniProfile savedProfile = alumniProfileRepository.save(profile);
        return convertToDto(savedProfile);
    }

    public List<AlumniProfileDto> getAllAlumni() {
        return alumniProfileRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AlumniProfileDto> searchAlumni(String query) {
        return alumniProfileRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query, query)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AlumniProfileDto> getAlumniByIndustry(String industry) {
        return alumniProfileRepository.findByIndustryContainingIgnoreCase(industry)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public long getAlumniCount() {
        return alumniProfileRepository.count();
    }

    @Transactional
    public void deleteProfile(UUID userId) {
        AlumniProfile profile = alumniProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Alumni profile not found for user ID: " + userId));
        alumniProfileRepository.delete(profile);
    }

    private AlumniProfileDto convertToDto(AlumniProfile profile) {
        return AlumniProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .bio(profile.getBio())
                .currentPosition(profile.getCurrentPosition())
                .currentCompany(profile.getCurrentCompany())
                .industry(profile.getIndustry())
                .successStory(profile.getSuccessStory())
                .linkedin(profile.getLinkedin())
                .twitter(profile.getTwitter())
                .avatarUrl(profile.getAvatarUrl())
                .country(profile.getCountry())
                .city(profile.getCity())
                .phone(profile.getPhone())
                .address(profile.getAddress())
                .website(profile.getWebsite())
                .graduationYear(profile.getGraduationYear())
                .degree(profile.getDegree())
                .skills(profile.getSkills())
                .achievements(profile.getAchievements())
                .mentorshipInterests(profile.getMentorshipInterests())
                .isActive(profile.getIsActive())
                .isPublic(profile.getIsPublic())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private void updateProfileFromRequest(AlumniProfile profile, AlumniProfileUpdateRequest request) {
        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName());
        if (request.getLastName() != null) profile.setLastName(request.getLastName());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getCurrentPosition() != null) profile.setCurrentPosition(request.getCurrentPosition());
        if (request.getCurrentCompany() != null) profile.setCurrentCompany(request.getCurrentCompany());
        if (request.getIndustry() != null) profile.setIndustry(request.getIndustry());
        if (request.getSuccessStory() != null) profile.setSuccessStory(request.getSuccessStory());
        if (request.getLinkedin() != null) profile.setLinkedin(request.getLinkedin());
        if (request.getTwitter() != null) profile.setTwitter(request.getTwitter());
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(request.getAvatarUrl());
        if (request.getCountry() != null) profile.setCountry(request.getCountry());
        if (request.getCity() != null) profile.setCity(request.getCity());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getWebsite() != null) profile.setWebsite(request.getWebsite());
        if (request.getGraduationYear() != null) profile.setGraduationYear(request.getGraduationYear());
        if (request.getDegree() != null) profile.setDegree(request.getDegree());
        if (request.getSkills() != null) profile.setSkills(request.getSkills());
        if (request.getAchievements() != null) profile.setAchievements(request.getAchievements());
        if (request.getMentorshipInterests() != null) profile.setMentorshipInterests(request.getMentorshipInterests());
    }
}
