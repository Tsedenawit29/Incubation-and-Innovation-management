package com.iims.iims.application_from.service;

import com.iims.iims.Cohort.entity.Cohort;
import com.iims.iims.Cohort.repos.CohortRepo;
import com.iims.iims.Industry.entity.Industry;
import com.iims.iims.Industry.repo.IndustryRepository;
import com.iims.iims.application_from.dto.ApplicationFormFieldDto;
import com.iims.iims.application_from.dto.ApplicationFormRequest;
import com.iims.iims.application_from.dto.ApplicationFormResponseDto;
import com.iims.iims.application_from.entity.ApplicationForm;
import com.iims.iims.application_from.entity.ApplicationFormField;
import com.iims.iims.application_from.entity.ApplicationFormType;
import com.iims.iims.application_from.repository.ApplicationFormRepository;
import com.iims.iims.tenant.entity.Tenant;
import com.iims.iims.tenant.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApplicationFormService {

    private final ApplicationFormRepository applicationFormRepository;
    private final TenantRepository tenantRepository;
    private final CohortRepo cohortRepo;
    private final IndustryRepository industryRepository;

    @Autowired
    public ApplicationFormService(
            ApplicationFormRepository applicationFormRepository,
            TenantRepository tenantRepository,
            CohortRepo cohortRepo,
            IndustryRepository industryRepository) {
        this.applicationFormRepository = applicationFormRepository;
        this.tenantRepository = tenantRepository;
        this.cohortRepo = cohortRepo;
        this.industryRepository = industryRepository;
    }

    /**
     * Creates a new application form for a given tenant.
     *
     * @param tenantId The UUID of the tenant creating the form.
     * @param request The ApplicationFormRequest DTO containing form details.
     * @return The created ApplicationFormResponseDto.
     * @throws EntityNotFoundException if the tenant, cohort, or industry is not found.
     */
    @Transactional
    public ApplicationFormResponseDto createApplicationForm(UUID tenantId, ApplicationFormRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with ID: " + tenantId));

        // Fetch Cohort and Industry entities based on IDs from the request
        Cohort cohort = null;
        if (request.getCohortId() != null) {
            cohort = cohortRepo.findByIdAndTenant(request.getCohortId(), tenant)
                    .orElseThrow(() -> new EntityNotFoundException("Cohort not found with ID: " + request.getCohortId() + " for this tenant."));
        }

        Industry industry = null;
        if (request.getIndustryId() != null) {
            industry = industryRepository.findByIdAndTenant(request.getIndustryId(), tenant)
                    .orElseThrow(() -> new EntityNotFoundException("Industry not found with ID: " + request.getIndustryId() + " for this tenant."));
        }

        ApplicationForm form = new ApplicationForm();
        form.setTenant(tenant);
        form.setName(request.getName());
        form.setDescription(request.getDescription());
        form.setCohort(cohort);
        form.setIndustry(industry);
        form.setType(request.getType());
        form.setActive(request.getActive());

        // Map DTO fields to entity fields
        List<ApplicationFormField> fields = request.getFields().stream()
                .map(fieldDto -> {
                    ApplicationFormField field = new ApplicationFormField();
                    field.setLabel(fieldDto.getLabel());
                    field.setDescription(fieldDto.getDescription());
                    field.setFieldType(fieldDto.getFieldType());
                    field.setIsRequired(fieldDto.getIsRequired());
                    field.setOptions(fieldDto.getOptions());
                    field.setOrderIndex(fieldDto.getOrderIndex());
                    field.setForm(form);
                    return field;
                })
                .collect(Collectors.toList());
        form.setFields(fields);

        ApplicationForm savedForm = applicationFormRepository.save(form);
        return convertToDto(savedForm);
    }

    /**
     * Retrieves an application form by its ID and tenant ID.
     * Ensures that a tenant can only access their own forms.
     *
     * @param formId   The UUID of the form.
     * @param tenantId The UUID of the tenant.
     * @return The ApplicationFormResponseDto.
     * @throws EntityNotFoundException if the tenant or form is not found for the given tenant.
     */
    @Transactional(readOnly = true)
    public ApplicationFormResponseDto getApplicationFormById(UUID formId, UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with ID: " + tenantId));

        ApplicationForm form = applicationFormRepository.findByIdAndTenant(formId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Application form not found with ID: " + formId + " from tenant " + tenantId));
        return convertToDto(form);
    }

    /**
     * Retrieves all application forms for a specific tenant.
     *
     * @param tenantId The UUID of the tenant.
     * @return A list of ApplicationFormResponseDto.
     * @throws EntityNotFoundException if the tenant is not found.
     */
    @Transactional(readOnly = true)
    public List<ApplicationFormResponseDto> getAllApplicationFormsByTenant(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with ID: " + tenantId));
        List<ApplicationForm> forms = applicationFormRepository.findByTenant(tenant);
        return forms.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves active application forms for a specific tenant and type.
     *
     * @param tenantId The UUID of the tenant.
     * @param type     The type of the form (STARTUP or MENTOR).
     * @return A list of active ApplicationFormResponseDto.
     * @throws EntityNotFoundException if the tenant is not found.
     */
    @Transactional(readOnly = true)
    public List<ApplicationFormResponseDto> getActiveApplicationFormsByTenantAndType(UUID tenantId, ApplicationFormType type) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with ID: " + tenantId));
        List<ApplicationForm> forms = applicationFormRepository.findByTenantAndTypeAndIsActive(tenant, type, true);
        return forms.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Updates an existing application form for a given tenant.
     * This method handles adding, updating, and removing fields.
     *
     * @param formId   The UUID of the form to update.
     * @param tenantId The UUID of the tenant owning the form.
     * @param request  The ApplicationFormRequest DTO with updated details.
     * @return The updated ApplicationFormResponseDto.
     * @throws EntityNotFoundException if the tenant, cohort, or industry is not found.
     */
    @Transactional
    public ApplicationFormResponseDto updateApplicationForm(UUID formId, UUID tenantId, ApplicationFormRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with ID: " + tenantId));
        ApplicationForm existingForm = applicationFormRepository.findByIdAndTenant(formId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Application form not found with ID: " + formId + " for tenant: " + tenantId));

        existingForm.setName(request.getName());
        existingForm.setDescription(request.getDescription());

        // Fetch Cohort and Industry entities based on IDs from the request
        Cohort cohort = null;
        if (request.getCohortId() != null) {
            cohort = cohortRepo.findByIdAndTenant(request.getCohortId(), tenant)
                    .orElseThrow(() -> new EntityNotFoundException("Cohort not found with ID: " + request.getCohortId() + " for this tenant."));
        }
        existingForm.setCohort(cohort);

        Industry industry = null;
        if (request.getIndustryId() != null) {
            industry = industryRepository.findByIdAndTenant(request.getIndustryId(), tenant)
                    .orElseThrow(() -> new EntityNotFoundException("Industry not found with ID: " + request.getIndustryId() + " for this tenant."));
        }
        existingForm.setIndustry(industry);

        existingForm.setType(request.getType());
        existingForm.setActive(request.getActive());

        // Clear existing fields to manage orphan removal and then add new/updated fields
        existingForm.getFields().clear();
        request.getFields().forEach(fieldDto -> {
            ApplicationFormField field = new ApplicationFormField();
            field.setLabel(fieldDto.getLabel());
            field.setDescription(fieldDto.getDescription());
            field.setFieldType(fieldDto.getFieldType());
            field.setIsRequired(fieldDto.getIsRequired());
            field.setOptions(fieldDto.getOptions());
            field.setOrderIndex(fieldDto.getOrderIndex());
            field.setForm(existingForm); // Set the back-reference
            existingForm.getFields().add(field);
        });
        ApplicationForm updatesForm = applicationFormRepository.save(existingForm);
        return convertToDto(updatesForm);
    }

    /**
     * Deletes an application form by its ID and tenant ID.
     *
     * @param formId   The UUID of the form to delete.
     * @param tenantId The UUID of the tenant owning the form.
     * @throws EntityNotFoundException if the tenant or form is not found for the given tenant.
     */
    @Transactional
    public void deleteApplicationForm(UUID formId, UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with ID: " + tenantId));
        ApplicationForm form = applicationFormRepository.findByIdAndTenant(formId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Application form not found with ID: " + formId + " for tenant: " + tenantId));
        applicationFormRepository.delete(form);
    }

    /**
     * Retrieves a public application form by its ID.
     *
     * @param formId   The UUID of the form to delete.
     * @throws AccessDeniedException if application form is not active for public use.
     */
    @Transactional
    public ApplicationFormResponseDto getPublicApplicationForm(UUID formId) {
        ApplicationForm form = applicationFormRepository.findById(formId)
                .orElseThrow(() -> new EntityNotFoundException("Application form not found with ID: " + formId));

        if (!form.getActive()) {
            throw new AccessDeniedException("This application form is not active for public access.");
        }
        return convertToDto(form);
    }

    /**
     * Clones an existing application form, creating a new form with a new ID.
     * All details including fields are copied, but new UUIDs are assigned.
     * The cloned form is set to be active and its creation/update timestamps are current.
     *
     * @param tenantId The UUID of the tenant to which the original form belongs.
     * @param originalFormId The UUID of the form to clone.
     * @return The created ApplicationFormResponseDto for the cloned form.
     * @throws EntityNotFoundException if the original form or tenant is not found.
     */
    @Transactional
    public ApplicationFormResponseDto cloneApplicationForm(UUID tenantId, UUID originalFormId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with ID: " + tenantId));

        ApplicationForm originalForm = applicationFormRepository.findByIdAndTenant(originalFormId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Original application form not found with ID: " + originalFormId + " for tenant: " + tenantId));

        ApplicationForm clonedForm = new ApplicationForm();
        clonedForm.setTenant(originalForm.getTenant()); // Link to the same tenant
        clonedForm.setName(originalForm.getName() + " (Cloned)");// Add suffix to name
        clonedForm.setDescription(originalForm.getDescription());
        clonedForm.setCohort(originalForm.getCohort());
        clonedForm.setIndustry(originalForm.getIndustry());
        clonedForm.setType(originalForm.getType());
        clonedForm.setActive(true); // Cloned forms are typically active by default
        clonedForm.setCreatedAt(LocalDateTime.now()); // New creation timestamp

        // Deep copy fields
        List<ApplicationFormField> clonedFields = originalForm.getFields().stream()
                .map(originalField -> {
                    ApplicationFormField newField = new ApplicationFormField();
                    newField.setLabel(originalField.getLabel());
                    newField.setDescription(originalField.getDescription());
                    newField.setFieldType(originalField.getFieldType());
                    newField.setIsRequired(originalField.getIsRequired());
                    newField.setOptions(originalField.getOptions());
                    newField.setOrderIndex(originalField.getOrderIndex());
                    newField.setForm(clonedForm); // Link to the new cloned form
                    return newField;
                })
                .collect(Collectors.toList());

        clonedForm.setFields(clonedFields);

        ApplicationForm savedClonedForm = applicationFormRepository.save(clonedForm);
        return convertToDto(savedClonedForm);
    }

    /**
     * Helper method to convert an ApplicationForm entity to its DTO representation.
     *
     * @param form The ApplicationForm entity.
     * @return The ApplicationFormResponseDto.
     */
    private ApplicationFormResponseDto convertToDto(ApplicationForm form) {
        List<ApplicationFormFieldDto> fieldDtos = form.getFields().stream()
                .map(field -> new ApplicationFormFieldDto(
                        field.getId(),
                        field.getLabel(),
                        field.getDescription(),
                        field.getFieldType(),
                        field.getIsRequired(),
                        field.getOptions(),
                        field.getOrderIndex()
                ))
                .collect(Collectors.toList());

        // Safely get the cohort and industry IDs by checking for null
        UUID cohortId = (form.getCohort() != null) ? form.getCohort().getId() : null;
        UUID industryId = (form.getIndustry() != null) ? form.getIndustry().getId() : null;

        return new ApplicationFormResponseDto(
                form.getId(),
                form.getTenant().getId(),
                form.getName(),
                form.getDescription(),
                cohortId,
                industryId,
                form.getType(),
                form.getActive(),
                form.getCreatedAt(),
                fieldDtos
        );
    }
}