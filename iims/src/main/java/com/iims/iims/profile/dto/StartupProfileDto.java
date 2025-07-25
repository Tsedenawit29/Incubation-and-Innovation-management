package com.iims.iims.profile.dto;

import lombok.Data;
import java.util.List; // Import List
import java.util.UUID;

@Data
public class StartupProfileDto {
    private UUID id;
    private UUID userId;
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
    private List<TeamMemberDto> teamMembers;
    private List<DocumentDto> documents;
}
