package com.iims.iims.tenant.controller;

import com.iims.iims.tenant.entity.Tenant;
import com.iims.iims.tenant.service.TenantService;
import com.iims.iims.tenant.dto.TenantRequestDto;
import com.iims.iims.tenant.dto.TenantApprovalDto;
import com.iims.iims.tenant.dto.TenantApprovalResponseDto;
import com.iims.iims.tenant.dto.TenantRejectionResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/tenant")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    // Apply for tenant registration (public endpoint)
    @PostMapping("/apply")
    public ResponseEntity<Tenant> applyForTenant(@RequestBody TenantRequestDto requestDto) {
        Tenant tenant = tenantService.createTenantRequest(requestDto);
        return ResponseEntity.ok(tenant);
    }

    // Get all pending tenant requests (super admin only)
    @GetMapping("/pending")
    public ResponseEntity<List<Tenant>> getPendingTenants() {
        List<Tenant> pendingTenants = tenantService.getPendingTenants();
        return ResponseEntity.ok(pendingTenants);
    }

    // Get all tenants (super admin only)
    @GetMapping
    public ResponseEntity<List<Tenant>> getAllTenants() {
        List<Tenant> tenants = tenantService.getAllTenants();
        return ResponseEntity.ok(tenants);
    }

    // Get tenant by ID
    @GetMapping("/{id}")
    public ResponseEntity<Tenant> getTenantById(@PathVariable UUID id) {
        Tenant tenant = tenantService.getTenantById(id);
        return ResponseEntity.ok(tenant);
    }

    // Approve/reject tenant (super admin only)
    @PostMapping("/approve/{id}")
    public ResponseEntity<TenantApprovalResponseDto> approveTenant(
            @PathVariable UUID id,
            @RequestBody TenantApprovalDto approvalDto,
            @RequestParam UUID approvedBy) {
        
        TenantApprovalResponseDto response = tenantService.approveTenant(id, approvedBy, approvalDto);
        return ResponseEntity.ok(response);
    }

    // Reject tenant (super admin only)
    @PostMapping("/reject/{id}")
    public ResponseEntity<TenantRejectionResponseDto> rejectTenant(
            @PathVariable UUID id,
            @RequestParam UUID rejectedBy,
            @RequestParam String reason) {
        TenantRejectionResponseDto response = tenantService.rejectTenant(id, rejectedBy, reason);
        return ResponseEntity.ok(response);
    }

    // Suspend tenant (super admin only)
    @PostMapping("/suspend/{id}")
    public ResponseEntity<Tenant> suspendTenant(@PathVariable UUID id) {
        Tenant tenant = tenantService.suspendTenant(id);
        return ResponseEntity.ok(tenant);
    }

    // Activate tenant (super admin only)
    @PostMapping("/activate/{id}")
    public ResponseEntity<Tenant> activateTenant(@PathVariable UUID id) {
        Tenant tenant = tenantService.activateTenant(id);
        return ResponseEntity.ok(tenant);
    }

    // Removed landing page endpoints and related imports
} 