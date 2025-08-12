package com.iims.iims.progresstracking.controller;

import com.iims.iims.progresstracking.dto.ProgressTemplateAssignmentRequestDTO;
import com.iims.iims.progresstracking.dto.ProgressTemplateAssignmentResponseDTO;
import com.iims.iims.progresstracking.dto.ProgressTemplateResponseDTO;
import com.iims.iims.progresstracking.entity.ProgressTemplateAssignment;
import com.iims.iims.progresstracking.entity.ProgressTemplate;
import com.iims.iims.user.entity.User;
import com.iims.iims.progresstracking.service.ProgressTemplateAssignmentService;
import com.iims.iims.progresstracking.repository.ProgressTemplateRepository;
import com.iims.iims.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progresstracking/assignments")
public class ProgressTemplateAssignmentController {
    @Autowired
    private ProgressTemplateAssignmentService assignmentService;
    @Autowired
    private ProgressTemplateRepository templateRepository;
    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ProgressTemplateAssignmentResponseDTO> assignTemplate(@RequestBody ProgressTemplateAssignmentRequestDTO dto) {
        ProgressTemplateAssignment assignment = new ProgressTemplateAssignment();
        if (dto.getTemplateId() != null) {
            Optional<ProgressTemplate> template = templateRepository.findById(dto.getTemplateId());
            template.ifPresent(assignment::setTemplate);
        }
        assignment.setAssignedToType(dto.getAssignedToType());
        assignment.setAssignedToId(dto.getAssignedToId());
        if (dto.getAssignedById() != null) {
            Optional<User> assignedBy = userRepository.findById(dto.getAssignedById());
            assignedBy.ifPresent(assignment::setAssignedBy);
        }
        ProgressTemplateAssignment saved = assignmentService.assignTemplate(assignment);
        return ResponseEntity.ok(toDTO(saved));
    }

    @GetMapping("/template/{templateId}")
    public ResponseEntity<List<ProgressTemplateAssignmentResponseDTO>> getAssignmentsByTemplate(@PathVariable UUID templateId) {
        List<ProgressTemplateAssignment> assignments = assignmentService.getAssignmentsByTemplate(templateId);
        List<ProgressTemplateAssignmentResponseDTO> dtos = assignments.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/assigned/{assignedToType}/{assignedToId}")
    public ResponseEntity<List<ProgressTemplateAssignmentResponseDTO>> getAssignmentsByAssignedTo(
            @PathVariable String assignedToType,
            @PathVariable UUID assignedToId) {
        List<ProgressTemplateAssignment> assignments = assignmentService.getAssignmentsByAssignedTo(assignedToId, assignedToType);
        List<ProgressTemplateAssignmentResponseDTO> dtos = assignments.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/assigned-templates/{assignedToType}/{assignedToId}")
    public ResponseEntity<List<ProgressTemplateResponseDTO>> getAssignedTemplatesWithDetails(
            @PathVariable String assignedToType,
            @PathVariable UUID assignedToId) {
        List<ProgressTemplateAssignment> assignments = assignmentService.getAssignmentsByAssignedTo(assignedToId, assignedToType);
        List<ProgressTemplateResponseDTO> templateDtos = assignments.stream()
                .map(assignment -> assignment.getTemplate())
                .filter(template -> template != null)
                .map(this::toTemplateDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(templateDtos);
    }

    @GetMapping
    public ResponseEntity<List<ProgressTemplateAssignmentResponseDTO>> getAllAssignments() {
        List<ProgressTemplateAssignment> assignments = assignmentService.getAllAssignments();
        List<ProgressTemplateAssignmentResponseDTO> dtos = assignments.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable UUID assignmentId) {
        assignmentService.deleteAssignment(assignmentId);
        return ResponseEntity.ok().build();
    }

    private ProgressTemplateAssignmentResponseDTO toDTO(ProgressTemplateAssignment entity) {
        ProgressTemplateAssignmentResponseDTO dto = new ProgressTemplateAssignmentResponseDTO();
        dto.setId(entity.getId());
        if (entity.getTemplate() != null) {
            dto.setTemplateId(entity.getTemplate().getId());
        }
        dto.setAssignedToType(entity.getAssignedToType());
        dto.setAssignedToId(entity.getAssignedToId());
        if (entity.getAssignedBy() != null) {
            dto.setAssignedById(entity.getAssignedBy().getId());
        }
        dto.setAssignedAt(entity.getAssignedAt());
        return dto;
    }

    private ProgressTemplateResponseDTO toTemplateDTO(ProgressTemplate entity) {
        ProgressTemplateResponseDTO dto = new ProgressTemplateResponseDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        if (entity.getTenant() != null) {
            dto.setTenantId(entity.getTenant().getId());
        }
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
} 