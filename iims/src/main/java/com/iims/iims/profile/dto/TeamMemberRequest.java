package com.iims.iims.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberRequest {
    // IMPORTANT: The 'id' field MUST be a String here.
    // The frontend sends it as a String (either a UUID string for existing members
    // or a temporary string for new ones).
    private String id;
    private String name;
    private String role;
    private String linkedin;
    private String avatarUrl;
}
