package com.iims.iims.tenant.dto;

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
public class TenantRejectionResponseDto {
    private UUID tenantId;
    private String name;
    private String email;
    private TenantStatus status;
    private LocalDateTime rejectedAt;
    private UUID rejectedBy;
    private String reason;
    private String message;
} 