package com.iims.iims.application_from.dto;

import com.iims.iims.application_from.entity.ApplicationFormType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationFormRequest {

    private UUID id;

    @NotBlank(message = "Form name cannot be empty")
    private String name;

    private String description;

    @NotNull(message = "Form type cannot be null")
    private ApplicationFormType type;

    private Boolean isActive = true;

    @Valid
    @NotNull(message = "Form fields cannot be null")
    @Size(min = 1, message = "A form must have at least one field")
    private List<ApplicationFormFieldDto> fields;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ApplicationFormType getType() {
        return type;
    }

    public void setType(ApplicationFormType type) {
        this.type = type;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }

    public List<ApplicationFormFieldDto> getFields() {
        return fields;
    }

    public void setFields(List<ApplicationFormFieldDto> fields) {
        this.fields = fields;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
