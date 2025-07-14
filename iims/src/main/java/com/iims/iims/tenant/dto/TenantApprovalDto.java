package com.iims.iims.tenant.dto;

import lombok.Data;

@Data
public class TenantApprovalDto {
    private boolean approved;
    private String reason; // Optional reason for rejection
} 