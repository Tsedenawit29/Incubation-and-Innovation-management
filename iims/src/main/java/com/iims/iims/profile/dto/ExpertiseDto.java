package com.iims.iims.profile.dto;

import lombok.Data;
import java.util.UUID;

/**
 * Data Transfer Object for an area of expertise.
 * Used for returning expertise details as part of a mentor profile.
 */
@Data
public class ExpertiseDto {
    private String id;
    private String expertiseName;
    private String description;
}
