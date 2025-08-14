package com.iims.iims.progresstracking.controller;

import com.iims.iims.progresstracking.dto.ProgressPhaseRequestDTO;
import com.iims.iims.progresstracking.dto.ProgressPhaseResponseDTO;
import com.iims.iims.progresstracking.entity.ProgressPhase;
import com.iims.iims.progresstracking.entity.ProgressTemplate;
import com.iims.iims.progresstracking.service.ProgressPhaseService;
import com.iims.iims.progresstracking.repository.ProgressTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progresstracking/phases")
public class ProgressPhaseController {
    @Autowired
    private ProgressPhaseService phaseService;
    @Autowired
    private ProgressTemplateRepository templateRepository;

    @PostMapping
    public ResponseEntity<ProgressPhaseResponseDTO> create(@RequestBody ProgressPhaseRequestDTO dto) {
        ProgressPhase phase = new ProgressPhase();
        phase.setName(dto.getName());
        phase.setOrderIndex(dto.getOrderIndex());
        if (dto.getTemplateId() != null) {
            Optional<ProgressTemplate> template = templateRepository.findById(dto.getTemplateId());
            template.ifPresent(phase::setTemplate);
        }
        ProgressPhase saved = phaseService.createPhase(phase);
        return ResponseEntity.ok(toDTO(saved));
    }

    @GetMapping
    public ResponseEntity<List<ProgressPhaseResponseDTO>> getAll(@RequestParam(required = false) UUID templateId) {
        List<ProgressPhase> phases;
        if (templateId != null) {
            phases = phaseService.getPhasesByTemplateId(templateId);
        } else {
            phases = phaseService.getAllPhases();
        }
        List<ProgressPhaseResponseDTO> dtos = phases.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgressPhaseResponseDTO> getById(@PathVariable UUID id) {
        Optional<ProgressPhase> phase = phaseService.getPhaseById(id);
        return phase.map(p -> ResponseEntity.ok(toDTO(p))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgressPhaseResponseDTO> update(@PathVariable UUID id, @RequestBody ProgressPhaseRequestDTO dto) {
        Optional<ProgressPhase> existingOpt = phaseService.getPhaseById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        ProgressPhase phase = existingOpt.get();
        phase.setName(dto.getName());
        phase.setOrderIndex(dto.getOrderIndex());
        if (dto.getTemplateId() != null) {
            Optional<ProgressTemplate> template = templateRepository.findById(dto.getTemplateId());
            template.ifPresent(phase::setTemplate);
        }
        ProgressPhase updated = phaseService.updatePhase(phase);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        phaseService.deletePhase(id);
        return ResponseEntity.noContent().build();
    }

    private ProgressPhaseResponseDTO toDTO(ProgressPhase entity) {
        ProgressPhaseResponseDTO dto = new ProgressPhaseResponseDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setOrderIndex(entity.getOrderIndex());
        if (entity.getTemplate() != null) {
            dto.setTemplateId(entity.getTemplate().getId());
        }
        return dto;
    }
} 