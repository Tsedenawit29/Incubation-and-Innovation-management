package com.iims.iims.application_from.controller;

import com.iims.iims.application_from.dto.ApplicationFormRequest;
import com.iims.iims.application_from.dto.ApplicationFormResponseDto;
import com.iims.iims.application_from.entity.ApplicationFormType;
import com.iims.iims.application_from.service.ApplicationFormService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/application-forms")
public class ApplicationFormController {

    private final ApplicationFormService applicationFormService;

    @Autowired
    public ApplicationFormController (ApplicationFormService applicationFormService){
        this.applicationFormService = applicationFormService;
    }
    /**
     * Creates a new application form for a specific tenant.
     *
     * @param tenantId The UUID of the tenant.
     * @param request  The ApplicationFormRequest DTO containing form details.
     * @return ResponseEntity with the created ApplicationFormResponseDto and HTTP status 201.
     */
    @PostMapping
    public ResponseEntity<ApplicationFormResponseDto> createApplicationForm(
            @PathVariable UUID tenantId,
            @Valid @RequestBody ApplicationFormRequest request
            ){
        ApplicationFormResponseDto createdForm = applicationFormService.createApplicationForm(tenantId, request);
        return new ResponseEntity<>(createdForm, HttpStatus.CREATED);
    }

    /**
     * Retrieves a specific application form by its ID for a given tenant.
     *
     * @param tenantId The UUID of the tenant.
     * @param formId   The UUID of the form.
     * @return ResponseEntity with the ApplicationFormResponseDto and HTTP status 200.
     */
    @GetMapping("/{formId}")
    private ResponseEntity<ApplicationFormResponseDto> getApplicationFormById(
            @PathVariable UUID tenantId,
            @PathVariable UUID formId) {
        ApplicationFormResponseDto form = applicationFormService.getApplicationFormById(formId, tenantId);
        return ResponseEntity.ok(form);
    }

    /**
     * Retrieves all application forms for a specific tenant.
     *
     * @param tenantId The UUID of the tenant.
     * @return ResponseEntity with a list of ApplicationFormResponseDto and HTTP status 200.
     */
    @GetMapping
    public ResponseEntity<List<ApplicationFormResponseDto>> getAllApplicationFormsByTenant(
            @PathVariable UUID tenantId) {
        List<ApplicationFormResponseDto> forms = applicationFormService.getAllApplicationFormsByTenant(tenantId);
        return ResponseEntity.ok(forms);
    }

    /**
     * Retrieves active application forms for a specific tenant and type.
     *
     * @param tenantId The UUID of the tenant.
     * @param type     The type of the form (e.g., STARTUP, MENTOR).
     * @return ResponseEntity with a list of ApplicationFormResponseDto and HTTP status 200.
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ApplicationFormResponseDto>> getActiveApplicationFormsByType(
            @PathVariable UUID tenantId,
            @PathVariable ApplicationFormType type) {
        List<ApplicationFormResponseDto> forms = applicationFormService.getActiveApplicationFormsByTenantAndType(tenantId, type);
        return ResponseEntity.ok(forms);
    }

    /**
     * Updates an existing application form for a specific tenant.
     *
     * @param tenantId The UUID of the tenant.
     * @param formId   The UUID of the form to update.
     * @param request  The ApplicationFormRequest DTO with updated details.
     * @return ResponseEntity with the updated ApplicationFormResponseDto and HTTP status 200.
     */
    @PutMapping("/{formId}")
    public ResponseEntity<ApplicationFormResponseDto> updateApplicationForm(
            @PathVariable UUID tenantId,
            @PathVariable UUID formId,
            @Valid @RequestBody ApplicationFormRequest request) {
        ApplicationFormResponseDto updatedForm = applicationFormService.updateApplicationForm(formId, tenantId, request);
        return ResponseEntity.ok(updatedForm);
    }

    /**
     * Deletes an application form by its ID for a specific tenant.
     *
     * @param tenantId The UUID of the tenant.
     * @param formId   The UUID of the form to delete.
     * @return ResponseEntity with no content and HTTP status 204.
     */
    @DeleteMapping("/{formId}")
    public ResponseEntity<Void> deleteApplicationForm(
            @PathVariable UUID tenantId,
            @PathVariable UUID formId) {
        applicationFormService.deleteApplicationForm(formId, tenantId);
        return ResponseEntity.noContent().build();
    }
}
