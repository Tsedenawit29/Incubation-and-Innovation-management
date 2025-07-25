package com.iims.iims.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberDto {
    // The 'id' field should be a String to match the frontend's expectation
    // and the conversion logic in StartupProfileService.toTeamMemberDto.
    private String id;
    private String name;
    private String role;
    private String linkedin;
    private String avatarUrl;
}
