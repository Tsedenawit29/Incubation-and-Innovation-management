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
public class InvestorProfileDto {
    private UUID id;
    private UUID userId;
    private String firstName;
    private String lastName;
    private String bio;
    private String currentPosition;
    private String currentCompany;
    private String investmentFocus;
    private String investmentPhilosophy;
    private String linkedin;
    private String twitter;
    private String avatarUrl;
    private String country;
    private String city;
    private String phone;
    private String address;
    private String website;
    private String yearsOfExperience;
    private String firmName;
    private String investmentCriteria;
    private String portfolioCompanies;
    private String mentorshipAreas;
    private String ticketSize;
    private String investmentStage;
    private Boolean isActive;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
