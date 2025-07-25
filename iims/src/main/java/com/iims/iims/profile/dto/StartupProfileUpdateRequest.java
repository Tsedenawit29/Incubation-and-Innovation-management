package com.iims.iims.profile.dto;

import lombok.Data;

@Data
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
}