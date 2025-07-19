package com.iims.iims.application_from.service;

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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApplicationFormService {

    private final ApplicationFormRepository applicationFormRepository;
    private final TenantRepository tenantRepository;

    @Autowired
    public ApplicationFormService(ApplicationFormRepository applicationFormRepository, TenantRepository tenantRepository){
        this.applicationFormRepository= applicationFormRepository;
        this.tenantRepository= tenantRepository;
    }

    /**
     * Creates a new application form for a given tenant.
     *
     * @param tenantId The UUID of the tenant creating the form.
     * @param request  The ApplicationFormRequest DTO containing form details.
     * @return The created ApplicationFormResponseDto.
     * @throws EntityNotFoundException if the tenant is not found.
     */
    @Transactional
    public ApplicationFormResponseDto createApplicationForm(UUID tenantId, ApplicationFormRequest request){
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with ID: " + tenantId));
        ApplicationForm form = new ApplicationForm();
        form.setTenant(tenant);// Set the Tenant entity
        form.setName(request.getName());
        form.setType(request.getType());
        form.setActive(request.getActive());

        // Map DTO fields to entity fields
        List<ApplicationFormField> fields = request.getFields().stream()
                .map(fieldDto ->{
                    ApplicationFormField field = new ApplicationFormField();
                    field.setLabel(fieldDto.getLabel());
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
    public ApplicationFormResponseDto getApplicationFormById(UUID formId, UUID tenantId){
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException(("Tenant not found with ID: " + tenantId)));

        ApplicationForm form = applicationFormRepository.findByIdAndTenant(formId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Application form not found with ID: " + formId + "from tenant" + tenantId));
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
    public List<ApplicationFormResponseDto> getAllApplicationFormsByTenant(UUID tenantId){
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
        // CORRECTED: Call the method with the updated name
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
     * @throws EntityNotFoundException if the tenant or form is not found for the given tenant.
     */
    @Transactional
    public ApplicationFormResponseDto updateApplicationForm(UUID formId, UUID tenantId, ApplicationFormRequest request){
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with ID: " + tenantId));
        ApplicationForm existingForm = applicationFormRepository.findByIdAndTenant(formId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Application form not found with ID: " + formId + " for tenant: " + tenantId));
        existingForm.setName(request.getName());
        existingForm.setType(request.getType());
        existingForm.setActive(request.getActive());

        // Clear existing fields to manage orphan removal and then add new/updated fields
        existingForm.getFields().clear();
        request.getFields().forEach(fieldDto -> {
            ApplicationFormField field = new ApplicationFormField();
            field.setLabel(fieldDto.getLabel());
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
    public void deleteApplicationForm(UUID formId, UUID tenantId){
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with ID: " + tenantId));
        ApplicationForm form = applicationFormRepository.findByIdAndTenant(formId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Application form not found with ID: " + formId + " for tenant: " + tenantId));
        applicationFormRepository.delete(form);
    }

    /**
     * Helper method to convert an ApplicationForm entity to its DTO representation.
     *
     * @param form The ApplicationForm entity.
     * @return The ApplicationFormResponseDto.
     */
    private ApplicationFormResponseDto convertToDto(ApplicationForm form){
        List<ApplicationFormFieldDto> fieldDtos = form.getFields().stream()
                .map(field -> new ApplicationFormFieldDto(
                        field.getId(),
                        field.getLabel(),
                        field.getFieldType(),
                        field.getIsRequired(),
                        field.getOptions(),
                        field.getOrderIndex()
                ))
                .collect(Collectors.toList());
        return new ApplicationFormResponseDto(
                form.getId(),
                form.getTenant().getId(),
                form.getName(),
                form.getType(),
                form.getActive(),
                form.getCreatedAt(),
                fieldDtos
        );
    }
}
