package com.iims.iims.profile.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * Data Transfer Object for creating or updating an area of expertise.
 * Represents the expertise data received from the client.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpertiseRequest {
    private String id; // Use String to handle UUID from client requests
    private String expertiseName;
    private String description;
}
