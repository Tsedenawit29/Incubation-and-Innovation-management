package com.iims.iims.tenant.service;

import com.iims.iims.tenant.entity.Tenant;
import com.iims.iims.tenant.entity.TenantStatus;
import com.iims.iims.tenant.repository.TenantRepository;
import com.iims.iims.tenant.dto.TenantRequestDto;
import com.iims.iims.tenant.dto.TenantApprovalDto;
import com.iims.iims.tenant.dto.TenantApprovalResponseDto;
import com.iims.iims.tenant.dto.TenantRejectionResponseDto;
import com.iims.iims.notification.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final EmailService emailService;

    public Tenant createTenantRequest(TenantRequestDto requestDto) {
        // Check if tenant with same email or name already exists
        if (tenantRepository.existsByEmail(requestDto.getEmail())) {
            throw new RuntimeException("Tenant with this email already exists");
        }
        
        if (tenantRepository.existsByName(requestDto.getName())) {
            throw new RuntimeException("Tenant with this name already exists");
        }

        Tenant tenant = Tenant.builder()
                .name(requestDto.getName())
                .email(requestDto.getEmail())
                .description(requestDto.getDescription())
                .address(requestDto.getAddress())
                .phone(requestDto.getPhone())
                .website(requestDto.getWebsite())
                .status(TenantStatus.PENDING)
                .build();

        return tenantRepository.save(tenant);
    }

    public List<Tenant> getPendingTenants() {
        return tenantRepository.findByStatus(TenantStatus.PENDING);
    }

    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    public Tenant getTenantById(UUID id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found with id: " + id));
    }

    public TenantApprovalResponseDto approveTenant(UUID tenantId, UUID approvedBy, TenantApprovalDto approvalDto) {
        Tenant tenant = getTenantById(tenantId);
        
        if (tenant.getStatus() != TenantStatus.PENDING) {
            throw new RuntimeException("Tenant is not in pending status");
        }

        if (approvalDto.isApproved()) {
            tenant.setStatus(TenantStatus.APPROVED);
            tenant.setApprovedAt(LocalDateTime.now());
            tenant.setApprovedBy(approvedBy);
            
            Tenant savedTenant = tenantRepository.save(tenant);
            
            // Send approval email
            String adminRegistrationUrl = "http://localhost:3000/register-admin/" + savedTenant.getId();
            emailService.sendTenantApprovalEmail(
                savedTenant.getEmail(), 
                savedTenant.getName(), 
                savedTenant.getId().toString(), 
                adminRegistrationUrl
            );
            
            return TenantApprovalResponseDto.builder()
                    .tenantId(savedTenant.getId())
                    .name(savedTenant.getName())
                    .email(savedTenant.getEmail())
                    .status(savedTenant.getStatus())
                    .approvedAt(savedTenant.getApprovedAt())
                    .approvedBy(savedTenant.getApprovedBy())
                    .message("Congratulations! Your tenant application has been approved.")
                    .nextSteps("You can now register admin users for your organization. Use your Tenant ID to register admins who will manage your organization's activities.")
                    .adminRegistrationUrl(adminRegistrationUrl)
                    .build();
        } else {
            throw new RuntimeException("Approval flag must be true for approval");
        }
    }

    public TenantRejectionResponseDto rejectTenant(UUID tenantId, UUID rejectedBy, String reason) {
        Tenant tenant = getTenantById(tenantId);
        
        if (tenant.getStatus() != TenantStatus.PENDING) {
            throw new RuntimeException("Tenant is not in pending status");
        }

        tenant.setStatus(TenantStatus.REJECTED);
        tenant.setRejectedAt(LocalDateTime.now());
        tenant.setRejectedBy(rejectedBy);
        tenant.setRejectionReason(reason);

        Tenant savedTenant = tenantRepository.save(tenant);
        
        // Send rejection email
        emailService.sendTenantRejectionEmail(
            savedTenant.getEmail(), 
            savedTenant.getName(), 
            reason
        );
        
        return TenantRejectionResponseDto.builder()
                .tenantId(savedTenant.getId())
                .name(savedTenant.getName())
                .email(savedTenant.getEmail())
                .status(savedTenant.getStatus())
                .rejectedAt(savedTenant.getRejectedAt())
                .rejectedBy(savedTenant.getRejectedBy())
                .reason(reason)
                .message("Your tenant application has been rejected. Please review the reason and consider reapplying.")
                .build();
    }

    public Tenant suspendTenant(UUID tenantId) {
        Tenant tenant = getTenantById(tenantId);
        tenant.setStatus(TenantStatus.SUSPENDED);
        return tenantRepository.save(tenant);
    }

    public Tenant activateTenant(UUID tenantId) {
        Tenant tenant = getTenantById(tenantId);
        tenant.setStatus(TenantStatus.APPROVED);
        return tenantRepository.save(tenant);
    }
} 