package com.iims.iims.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {
    // THIS IS THE CRUCIAL CHANGE: The 'id' field MUST be a String here.
    // The service converts the UUID from the entity to a String for this DTO.
    private String id;
    private String name;
    private String url;
    private String fileType;
}
