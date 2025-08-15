package com.iims.iims.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestorProfileUpdateRequest {
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
}
