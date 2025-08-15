package com.iims.iims.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlumniProfileDto {
    private UUID id;
    private UUID userId;
    private String firstName;
    private String lastName;
    private String bio;
    private String currentPosition;
    private String currentCompany;
    private String industry;
    private String successStory;
    private String linkedin;
    private String twitter;
    private String avatarUrl;
    private String country;
    private String city;
    private String phone;
    private String address;
    private String website;
    private String graduationYear;
    private String degree;
    private String skills;
    private String achievements;
    private String mentorshipInterests;
    private Boolean isActive;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
