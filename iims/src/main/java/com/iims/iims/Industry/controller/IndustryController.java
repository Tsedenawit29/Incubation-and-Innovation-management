package com.iims.iims.Industry.controller;

import com.iims.iims.Industry.dto.IndustryRequest;
import com.iims.iims.Industry.dto.IndustryResponse;
import com.iims.iims.Industry.service.IndustryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/industries")
public class IndustryController {

    private final IndustryService industryService;

    public IndustryController(IndustryService industryService) {
        this.industryService = industryService;
    }

    /**
     * Endpoint for a tenant to create a new industry.
     *
     * @param tenantId The UUID of the tenant.
     * @param request The DTO containing the industry data.
     * @return ResponseEntity with the created IndustryResponse and HTTP status 201.
     */
    @PostMapping
    public ResponseEntity<IndustryResponse> createIndustry(
            @PathVariable UUID tenantId,
            @Valid @RequestBody IndustryRequest request) {
        IndustryResponse response = industryService.createIndustry(tenantId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Retrieves a specific industry belonging to a tenant by its ID.
     *
     * @param tenantId The UUID of the tenant.
     * @param industryId The UUID of the industry.
     * @return ResponseEntity with the IndustryResponse and HTTP status 200.
     */
    @GetMapping("/{industryId}")
    public ResponseEntity<IndustryResponse> getIndustryById(
            @PathVariable UUID tenantId,
            @PathVariable UUID industryId) {
        IndustryResponse industry = industryService.getIndustryById(industryId, tenantId);
        return ResponseEntity.ok(industry);
    }

    /**
     * Retrieves all industries belonging to a specific tenant.
     *
     * @param tenantId The UUID of the tenant.
     * @return ResponseEntity with a list of IndustryResponse and HTTP status 200.
     */
    @GetMapping
    public ResponseEntity<List<IndustryResponse>> getAllIndustries(@PathVariable UUID tenantId) {
        List<IndustryResponse> industries = industryService.getAllIndustries(tenantId);
        return ResponseEntity.ok(industries);
    }

    /**
     * Updates an industry belonging to a specific tenant by its ID.
     *
     * @param tenantId The UUID of the tenant.
     * @param industryId The UUID of the industry.
     * @param request The DTO containing the updated industry data.
     * @return ResponseEntity with the updated IndustryResponse and HTTP status 200.
     */
    @PutMapping("/{industryId}")
    public ResponseEntity<IndustryResponse> updateIndustry(
            @PathVariable UUID tenantId,
            @PathVariable UUID industryId,
            @Valid @RequestBody IndustryRequest request) {
        IndustryResponse updatedIndustry = industryService.updateIndustry(industryId, tenantId, request);
        return ResponseEntity.ok(updatedIndustry);
    }

    /**
     * Deletes an industry belonging to a specific tenant by its ID.
     *
     * @param tenantId The UUID of the tenant.
     * @param industryId The UUID of the industry.
     * @return ResponseEntity with no content and HTTP status 204.
     */
    @DeleteMapping("/{industryId}")
    public ResponseEntity<Void> deleteIndustry(
            @PathVariable UUID tenantId,
            @PathVariable UUID industryId) {
        industryService.deleteIndustry(industryId, tenantId);
        return ResponseEntity.noContent().build();
    }
}