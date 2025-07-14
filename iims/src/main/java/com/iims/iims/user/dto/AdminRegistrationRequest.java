package com.iims.iims.user.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class AdminRegistrationRequest {
    private String fullName;
    private String email;
    private String phone;
    private String position;
    private UUID tenantId;
} 