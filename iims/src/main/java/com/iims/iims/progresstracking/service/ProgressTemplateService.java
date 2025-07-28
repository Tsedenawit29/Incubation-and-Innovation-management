package com.iims.iims.progresstracking.service;

import com.iims.iims.progresstracking.entity.ProgressTemplate;
import com.iims.iims.progresstracking.repository.ProgressTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProgressTemplateService {
    @Autowired
    private ProgressTemplateRepository templateRepo;

    public ProgressTemplate createTemplate(ProgressTemplate template) {
        template.setId(UUID.randomUUID());
        template.setCreatedAt(LocalDateTime.now());
        return templateRepo.save(template);
    }

    public List<ProgressTemplate> getAllTemplates() {
        return templateRepo.findAll();
    }

    public Optional<ProgressTemplate> getTemplateById(UUID id) {
        return templateRepo.findById(id);
    }

    public ProgressTemplate updateTemplate(ProgressTemplate template) {
        return templateRepo.save(template);
    }

    public void deleteTemplate(UUID id) {
        templateRepo.deleteById(id);
    }

    public List<ProgressTemplate> getTemplatesByTenant(UUID tenantId) {
        return templateRepo.findByTenant_Id(tenantId);
    }
} 