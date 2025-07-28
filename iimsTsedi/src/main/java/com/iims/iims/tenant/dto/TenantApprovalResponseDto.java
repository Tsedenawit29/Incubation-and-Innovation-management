package com.iims.iims.tenant.dto;

import com.iims.iims.tenant.entity.Tenant;
import com.iims.iims.tenant.entity.TenantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantApprovalResponseDto {
    private UUID tenantId;
    private String name;
    private String email;
    private TenantStatus status;
    private LocalDateTime approvedAt;
    private UUID approvedBy;
    private String message;
    private String nextSteps;
    private String adminRegistrationUrl;
} 