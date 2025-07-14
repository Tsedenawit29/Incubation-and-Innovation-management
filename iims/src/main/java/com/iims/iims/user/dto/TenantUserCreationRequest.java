package com.iims.iims.user.dto;

import com.iims.iims.user.entity.Role;
import lombok.Data;

@Data
public class TenantUserCreationRequest {
    private String fullName;
    private String email;
    private Role role; // STARTUP, MENTOR, etc.
} 