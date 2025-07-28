package com.iims.iims.progresstracking.controller;

import com.iims.iims.progresstracking.dto.ProgressTemplateRequestDTO;
import com.iims.iims.progresstracking.dto.ProgressTemplateResponseDTO;
import com.iims.iims.progresstracking.entity.ProgressTemplate;
import com.iims.iims.progresstracking.service.ProgressTemplateService;
import com.iims.iims.tenant.entity.Tenant;
import com.iims.iims.tenant.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progresstracking/templates")
public class ProgressTemplateController {
    @Autowired
    private ProgressTemplateService templateService;
    @Autowired
    private TenantRepository tenantRepository;

    @PostMapping
    public ResponseEntity<ProgressTemplateResponseDTO> create(@RequestBody ProgressTemplateRequestDTO dto) {
        ProgressTemplate template = new ProgressTemplate();
        template.setName(dto.getName());
        template.setDescription(dto.getDescription());
        if (dto.getTenantId() != null) {
            Optional<Tenant> tenant = tenantRepository.findById(dto.getTenantId());
            tenant.ifPresent(template::setTenant);
        }
        ProgressTemplate saved = templateService.createTemplate(template);
        return ResponseEntity.ok(toDTO(saved));
    }

    @GetMapping
    public ResponseEntity<List<ProgressTemplateResponseDTO>> getAll() {
        List<ProgressTemplate> templates = templateService.getAllTemplates();
        List<ProgressTemplateResponseDTO> dtos = templates.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<ProgressTemplateResponseDTO>> getByTenant(@PathVariable UUID tenantId) {
        List<ProgressTemplate> templates = templateService.getTemplatesByTenant(tenantId);
        List<ProgressTemplateResponseDTO> dtos = templates.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgressTemplateResponseDTO> getById(@PathVariable UUID id) {
        Optional<ProgressTemplate> template = templateService.getTemplateById(id);
        return template.map(t -> ResponseEntity.ok(toDTO(t))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgressTemplateResponseDTO> update(@PathVariable UUID id, @RequestBody ProgressTemplateRequestDTO dto) {
        Optional<ProgressTemplate> existingOpt = templateService.getTemplateById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        ProgressTemplate template = existingOpt.get();
        template.setName(dto.getName());
        template.setDescription(dto.getDescription());
        if (dto.getTenantId() != null) {
            Optional<Tenant> tenant = tenantRepository.findById(dto.getTenantId());
            tenant.ifPresent(template::setTenant);
        }
        ProgressTemplate updated = templateService.updateTemplate(template);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    private ProgressTemplateResponseDTO toDTO(ProgressTemplate entity) {
        ProgressTemplateResponseDTO dto = new ProgressTemplateResponseDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setCreatedAt(entity.getCreatedAt());
        if (entity.getTenant() != null) {
            dto.setTenantId(entity.getTenant().getId());
        }
        return dto;
    }
} 