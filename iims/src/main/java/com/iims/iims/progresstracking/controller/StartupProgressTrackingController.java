package com.iims.iims.progresstracking.controller;

import com.iims.iims.progresstracking.dto.StartupProgressTrackingRequestDTO;
import com.iims.iims.progresstracking.dto.StartupProgressTrackingResponseDTO;
import com.iims.iims.progresstracking.entity.StartupProgressTracking;
import com.iims.iims.progresstracking.entity.ProgressTemplateAssignment;
import com.iims.iims.progresstracking.service.StartupProgressTrackingService;
import com.iims.iims.progresstracking.repository.ProgressTemplateAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progresstracking/trackings")
public class StartupProgressTrackingController {
    @Autowired
    private StartupProgressTrackingService trackingService;
    @Autowired
    private ProgressTemplateAssignmentRepository assignmentRepository;

    @PostMapping
    public ResponseEntity<StartupProgressTrackingResponseDTO> create(@RequestBody StartupProgressTrackingRequestDTO dto) {
        StartupProgressTracking tracking = new StartupProgressTracking();
        if (dto.getAssignmentId() != null) {
            Optional<ProgressTemplateAssignment> assignment = assignmentRepository.findById(dto.getAssignmentId());
            assignment.ifPresent(tracking::setAssignment);
        }
        tracking.setStartedAt(dto.getStartedAt());
        tracking.setCompletedAt(dto.getCompletedAt());
        StartupProgressTracking saved = trackingService.createTracking(tracking);
        return ResponseEntity.ok(toDTO(saved));
    }

    @GetMapping
    public ResponseEntity<List<StartupProgressTrackingResponseDTO>> getAll() {
        List<StartupProgressTracking> trackings = trackingService.getAllTrackings();
        List<StartupProgressTrackingResponseDTO> dtos = trackings.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StartupProgressTrackingResponseDTO> getById(@PathVariable UUID id) {
        Optional<StartupProgressTracking> tracking = trackingService.getTrackingById(id);
        return tracking.map(t -> ResponseEntity.ok(toDTO(t))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<StartupProgressTrackingResponseDTO> update(@PathVariable UUID id, @RequestBody StartupProgressTrackingRequestDTO dto) {
        Optional<StartupProgressTracking> existingOpt = trackingService.getTrackingById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        StartupProgressTracking tracking = existingOpt.get();
        if (dto.getAssignmentId() != null) {
            Optional<ProgressTemplateAssignment> assignment = assignmentRepository.findById(dto.getAssignmentId());
            assignment.ifPresent(tracking::setAssignment);
        }
        tracking.setStartedAt(dto.getStartedAt());
        tracking.setCompletedAt(dto.getCompletedAt());
        StartupProgressTracking updated = trackingService.updateTracking(tracking);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        trackingService.deleteTracking(id);
        return ResponseEntity.noContent().build();
    }

    private StartupProgressTrackingResponseDTO toDTO(StartupProgressTracking entity) {
        StartupProgressTrackingResponseDTO dto = new StartupProgressTrackingResponseDTO();
        dto.setId(entity.getId());
        if (entity.getAssignment() != null) {
            dto.setAssignmentId(entity.getAssignment().getId());
        }
        dto.setStartedAt(entity.getStartedAt());
        dto.setCompletedAt(entity.getCompletedAt());
        return dto;
    }
} 