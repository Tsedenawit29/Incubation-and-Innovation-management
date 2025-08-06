package com.iims.iims.profile.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

/**
 * Data Transfer Object for a mentor's profile.
 * Represents the data returned to the client.
 */
@Data
public class MentorProfileDto {
    private UUID id;
    private UUID userId;
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
    private List<ExpertiseDto> expertise;
}
