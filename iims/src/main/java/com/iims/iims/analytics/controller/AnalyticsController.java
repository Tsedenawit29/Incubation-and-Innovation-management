package com.iims.iims.analytics.controller;

import com.iims.iims.analytics.dto.AnalyticsResponse;
import com.iims.iims.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'TENANT_MANAGER')")
    public ResponseEntity<AnalyticsResponse> getDashboardAnalytics(
            @RequestParam(required = false) UUID tenantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (tenantId == null) {
            // Get tenant ID from the authenticated user if not provided
            tenantId = getCurrentUserTenantId();
        }
        
        AnalyticsResponse response = analyticsService.getDashboardAnalytics(tenantId, startDate, endDate);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'TENANT_MANAGER')")
    public ResponseEntity<AnalyticsResponse> getUserAnalytics(
            @RequestParam(required = false) UUID tenantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (tenantId == null) {
            tenantId = getCurrentUserTenantId();
        }
        
        AnalyticsResponse response = analyticsService.getUserAnalytics(tenantId, startDate, endDate);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/startups")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'TENANT_MANAGER')")
    public ResponseEntity<AnalyticsResponse> getStartupAnalytics(
            @RequestParam(required = false) UUID tenantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (tenantId == null) {
            tenantId = getCurrentUserTenantId();
        }
        
        AnalyticsResponse response = analyticsService.getStartupAnalytics(tenantId, startDate, endDate);
        return ResponseEntity.ok(response);
    }
    
    // Helper method to get current user's tenant ID
    private UUID getCurrentUserTenantId() {
        // Implementation to get tenant ID from security context
        // This is a placeholder - implement based on your security setup
        return null;
    }
}
