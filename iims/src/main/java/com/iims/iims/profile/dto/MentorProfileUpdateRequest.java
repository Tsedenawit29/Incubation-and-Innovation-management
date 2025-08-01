package com.iims.iims.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data Transfer Object for updating a mentor's profile.
 * Represents the data received from the client for an update operation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String bio;
    private String title;
    private String experience;
    private String linkedin;
    private String twitter;
    private String avatarUrl;
    private String country;
    private String city;
    private List<ExpertiseRequest> expertise;
}
