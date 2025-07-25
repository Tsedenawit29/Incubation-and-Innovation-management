package com.iims.iims.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import com.iims.iims.profile.dto.TeamMemberRequest;
import com.iims.iims.profile.dto.DocumentRequest;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartupProfileUpdateRequest {
    private String startupName;
    private String description;
    private String website;
    private String phone;
    private String address;
    private String linkedin;
    private String twitter;
    private String logoUrl;
    private String mission;
    private String vision;
    private String industry;
    private String country;
    private String city;
    private List<TeamMemberRequest> teamMembers; // List of TeamMemberRequest DTOs
    private List<DocumentRequest> documents;     // List of DocumentRequest DTOs
}
