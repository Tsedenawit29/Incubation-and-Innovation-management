package com.iims.iims.application_from.controller;

import com.iims.iims.application_from.dto.ApplicationFormResponseDto;
import com.iims.iims.application_from.service.ApplicationFormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public")
public class PublicApplicationFormController {

    private final ApplicationFormService applicationFormService;

    @Autowired
    public PublicApplicationFormController(ApplicationFormService applicationFormService) {
        this.applicationFormService = applicationFormService;
    }

    @GetMapping("/application-forms/{formId}")
    public ResponseEntity<ApplicationFormResponseDto> getPublicApplicationForm(@PathVariable UUID formId) {
        System.out.println("Backend: Hitting /public/application-forms/{formId} for form: " + formId);
        ApplicationFormResponseDto form = applicationFormService.getPublicApplicationForm(formId);
        return ResponseEntity.ok(form);
    }
}
