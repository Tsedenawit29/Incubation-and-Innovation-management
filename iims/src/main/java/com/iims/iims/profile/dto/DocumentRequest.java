package com.iims.iims.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentRequest {
    // The 'id' field should be a String because the frontend sends it as a String
    // (either a UUID string for existing documents or a temporary string for new ones).
    private String id;
    private String name;
    private String url;
    private String fileType;
}
