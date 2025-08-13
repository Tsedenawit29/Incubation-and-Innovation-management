package com.iims.iims.progresstracking.controller;

import com.iims.iims.progresstracking.dto.ProgressSubmissionRequestDTO;
import com.iims.iims.progresstracking.dto.ProgressSubmissionResponseDTO;
import com.iims.iims.progresstracking.entity.ProgressSubmission;
import com.iims.iims.progresstracking.entity.StartupProgressTracking;
import com.iims.iims.progresstracking.entity.ProgressTask;
import com.iims.iims.progresstracking.service.ProgressSubmissionService;
import com.iims.iims.progresstracking.repository.StartupProgressTrackingRepository;
import com.iims.iims.progresstracking.repository.ProgressTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progresstracking/submissions")
public class ProgressSubmissionController {
    @Autowired
    private ProgressSubmissionService submissionService;
    @Autowired
    private StartupProgressTrackingRepository trackingRepository;
    @Autowired
    private ProgressTaskRepository taskRepository;

    @PostMapping
    public ResponseEntity<ProgressSubmissionResponseDTO> create(@RequestBody ProgressSubmissionRequestDTO dto) {
        ProgressSubmission submission = new ProgressSubmission();
        if (dto.getTrackingId() != null) {
            Optional<StartupProgressTracking> tracking = trackingRepository.findById(dto.getTrackingId());
            tracking.ifPresent(submission::setTracking);
        }
        if (dto.getTaskId() != null) {
            Optional<ProgressTask> task = taskRepository.findById(dto.getTaskId());
            task.ifPresent(submission::setTask);
        }
        submission.setSubmissionFileUrl(dto.getSubmissionFileUrl());
        submission.setFeedback(dto.getFeedback());
        submission.setMentorFeedback(dto.getMentorFeedback());
        submission.setStatus(dto.getStatus());
        submission.setScore(dto.getScore());
        submission.setRubric(dto.getRubric());
        submission.setComments(dto.getComments());
        submission.setVersion(dto.getVersion());
        ProgressSubmission saved = submissionService.createSubmission(submission);
        return ResponseEntity.ok(toDTO(saved));
    }

    @GetMapping
    public ResponseEntity<List<ProgressSubmissionResponseDTO>> getAll() {
        List<ProgressSubmission> submissions = submissionService.getAllSubmissions();
        List<ProgressSubmissionResponseDTO> dtos = submissions.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgressSubmissionResponseDTO> getById(@PathVariable UUID id) {
        Optional<ProgressSubmission> submission = submissionService.getSubmissionById(id);
        return submission.map(s -> ResponseEntity.ok(toDTO(s))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgressSubmissionResponseDTO> update(@PathVariable UUID id, @RequestBody ProgressSubmissionRequestDTO dto) {
        Optional<ProgressSubmission> existingOpt = submissionService.getSubmissionById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        ProgressSubmission submission = existingOpt.get();
        if (dto.getTrackingId() != null) {
            Optional<StartupProgressTracking> tracking = trackingRepository.findById(dto.getTrackingId());
            tracking.ifPresent(submission::setTracking);
        }
        if (dto.getTaskId() != null) {
            Optional<ProgressTask> task = taskRepository.findById(dto.getTaskId());
            task.ifPresent(submission::setTask);
        }
        submission.setSubmissionFileUrl(dto.getSubmissionFileUrl());
        submission.setFeedback(dto.getFeedback());
        submission.setMentorFeedback(dto.getMentorFeedback());
        submission.setStatus(dto.getStatus());
        submission.setScore(dto.getScore());
        submission.setRubric(dto.getRubric());
        submission.setComments(dto.getComments());
        submission.setVersion(dto.getVersion());
        ProgressSubmission updated = submissionService.updateSubmission(submission);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        submissionService.deleteSubmission(id);
        return ResponseEntity.noContent().build();
    }

    private ProgressSubmissionResponseDTO toDTO(ProgressSubmission entity) {
        ProgressSubmissionResponseDTO dto = new ProgressSubmissionResponseDTO();
        dto.setId(entity.getId());
        if (entity.getTracking() != null) {
            dto.setTrackingId(entity.getTracking().getId());
            // Get startup ID from the assignment relationship
            if (entity.getTracking().getAssignment() != null) {
                UUID startupId = entity.getTracking().getAssignment().getAssignedToId();
                dto.setStartupId(startupId);
                dto.setUserId(startupId); // Assuming startupId is the userId for filtering
            }
        }
        if (entity.getTask() != null) {
            dto.setTaskId(entity.getTask().getId());
        }
        dto.setSubmissionFileUrl(entity.getSubmissionFileUrl());
        dto.setFeedback(entity.getFeedback());
        dto.setMentorFeedback(entity.getMentorFeedback());
        dto.setSubmittedAt(entity.getSubmittedAt());
        dto.setStatus(entity.getStatus());
        dto.setComments(entity.getComments());
        dto.setScore(entity.getScore());
        dto.setRubric(entity.getRubric());
        dto.setVersion(entity.getVersion());
        return dto;
    }
}