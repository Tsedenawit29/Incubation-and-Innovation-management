package com.iims.iims.application_from.dto;

import com.iims.iims.application_from.entity.FieldType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationFormFieldDto {

    private UUID id;

    @NotBlank(message = "Field label cannot be null")
    private String label;

    @NotBlank(message = "Field type cannot be null")
    private FieldType fieldType;

    private List<String> options;

    private Boolean isRequired = false;

    private Integer orderIndex;

    public ApplicationFormFieldDto(
            UUID id,
            String label,
            FieldType fieldType,
            Boolean required,
            List<String> options,
            Integer orderIndex) {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Boolean getRequired() {
        return isRequired;
    }

    public void setRequired(Boolean required) {
        isRequired = required;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public FieldType getFieldType() {
        return fieldType;
    }

    public void setFieldType(FieldType fieldType) {
        this.fieldType = fieldType;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
}
