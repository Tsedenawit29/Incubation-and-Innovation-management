package com.iims.iims.application_from.controller;

import com.iims.iims.application_from.dto.ApplicationResponseDto;
import com.iims.iims.application_from.dto.ApplicationReviewDto;
import com.iims.iims.application_from.dto.SubmitApplicationRequest;
import com.iims.iims.application_from.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ApplicationController {

    private final ApplicationService applicationService;

    @Autowired
    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    /**
     * Endpoint for applicants to submit a new application.
     * This endpoint does not require a tenantId in the path as the formId
     * implicitly links to the tenant.
     *
     * @param submitRequest The SubmitApplicationRequest DTO containing application data.
     * @return ResponseEntity with the created ApplicationResponseDto and HTTP status 201.
     */
    @PostMapping("/applications/submit")
    public ResponseEntity<ApplicationResponseDto> submitApplication(
            @Valid @RequestBody SubmitApplicationRequest submitRequest) {
        ApplicationResponseDto createdApplication = applicationService.submitApplication(submitRequest);
        return new ResponseEntity<>(createdApplication, HttpStatus.CREATED);
    }

    /**
     * Retrieves a specific submitted application by its ID for a given tenant.
     * This endpoint is for tenants to view applications submitted to their forms.
     *
     * @param tenantId The UUID of the tenant.
     * @param applicationId The UUID of the application.
     * @return ResponseEntity with the ApplicationResponseDto and HTTP status 200.
     */
    @GetMapping("/tenants/{tenantId}/applications/{applicationId}")
    public ResponseEntity<ApplicationResponseDto> getApplicationById(
            @PathVariable UUID tenantId,
            @PathVariable UUID applicationId) {
        ApplicationResponseDto application = applicationService.getApplicationById(applicationId, tenantId);
        return ResponseEntity.ok(application);
    }

    /**
     * Retrieves all applications submitted to a specific form for a given tenant.
     *
     * @param tenantId The UUID of the tenant.
     * @param formId The UUID of the form.
     * @return ResponseEntity with a list of ApplicationResponseDto and HTTP status 200.
     */
    @GetMapping("/tenants/{tenantId}/application-forms/{formId}/applications")
    public ResponseEntity<List<ApplicationResponseDto>> getApplicationsByFormId(
            @PathVariable UUID tenantId,
            @PathVariable UUID formId) {
        List<ApplicationResponseDto> applications = applicationService.getApplicationsByFormId(formId, tenantId);
        return ResponseEntity.ok(applications);
    }

    /**
     * Retrieves all applications belonging to a specific tenant.
     *
     * @param tenantId The UUID of the tenant.
     * @return ResponseEntity with a list of ApplicationResponseDto and HTTP status 200.
     */
    @GetMapping("/tenants/{tenantId}/applications")
    public ResponseEntity<List<ApplicationResponseDto>> getAllApplicationsByTenant(
            @PathVariable UUID tenantId) {
        List<ApplicationResponseDto> applications = applicationService.getAllApplicationsByTenant(tenantId);
        return ResponseEntity.ok(applications);
    }

    /**
     * Updates the status of a submitted application (e.g., PENDING to APPROVED/REJECTED).
     * This action is typically performed by a tenant.
     *
     * @param tenantId The UUID of the tenant performing the update.
     * @param reviewDto The ApplicationReviewDto containing the application ID and new status.
     * @return ResponseEntity with the updated ApplicationResponseDto and HTTP status 200.
     */
    @PatchMapping("/tenants/{tenantId}/applications/status")
    public ResponseEntity<ApplicationResponseDto> updateApplicationStatus(
            @PathVariable UUID tenantId,
            @Valid @RequestBody ApplicationReviewDto reviewDto) {
        ApplicationResponseDto updatedApplication = applicationService.updateApplicationStatus(reviewDto, tenantId);
        return ResponseEntity.ok(updatedApplication);
    }
}
