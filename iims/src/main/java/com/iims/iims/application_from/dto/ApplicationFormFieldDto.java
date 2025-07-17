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

    private Integer orderIndex;
}
