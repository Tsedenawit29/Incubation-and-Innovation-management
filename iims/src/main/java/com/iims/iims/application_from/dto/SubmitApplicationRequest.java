package com.iims.iims.application_from.dto;

import com.iims.iims.application_from.entity.ApplicantType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitApplicationRequest {

    @NotNull(message = "Form ID cannot be null")
    private UUID formId;

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Invalid email format")
    private String email;

    private String firstName;
    private String lastName;

    @NotNull(message = "Applicant type cannot be null")
    private ApplicantType applicantType;

    @Valid
    @NotNull(message = "Field responses cannot be null")
    private List<ApplicationFieldResponseRequest> fieldResponses;
}
