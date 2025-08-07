package com.iims.iims.progresstracking.controller;

import com.iims.iims.progresstracking.dto.ProgressTaskRequestDTO;
import com.iims.iims.progresstracking.dto.ProgressTaskResponseDTO;
import com.iims.iims.progresstracking.entity.ProgressTask;
import com.iims.iims.progresstracking.entity.ProgressPhase;
import com.iims.iims.user.entity.User;
import com.iims.iims.progresstracking.service.ProgressTaskService;
import com.iims.iims.progresstracking.repository.ProgressPhaseRepository;
import com.iims.iims.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progresstracking/tasks")
public class ProgressTaskController {
    @Autowired
    private ProgressTaskService taskService;
    @Autowired
    private ProgressPhaseRepository phaseRepository;
    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ProgressTaskResponseDTO> create(@RequestBody ProgressTaskRequestDTO dto) {
        ProgressTask task = new ProgressTask();
        task.setTaskName(dto.getTaskName());
        task.setDescription(dto.getDescription());
        task.setDueDays(dto.getDueDays());
        task.setDueDate(dto.getDueDate());
        if (dto.getPhaseId() != null) {
            Optional<ProgressPhase> phase = phaseRepository.findById(dto.getPhaseId());
            phase.ifPresent(task::setPhase);
        }
        if (dto.getMentorId() != null) {
            Optional<User> mentor = userRepository.findById(dto.getMentorId());
            mentor.ifPresent(task::setMentor);
        }
        ProgressTask saved = taskService.createTask(task);
        return ResponseEntity.ok(toDTO(saved));
    }

    @GetMapping
    public ResponseEntity<List<ProgressTaskResponseDTO>> getAll(@RequestParam(required = false) UUID phaseId) {
        List<ProgressTask> tasks;
        if (phaseId != null) {
            tasks = taskService.getTasksByPhaseId(phaseId);
        } else {
            tasks = taskService.getAllTasks();
        }
        List<ProgressTaskResponseDTO> dtos = tasks.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgressTaskResponseDTO> getById(@PathVariable UUID id) {
        Optional<ProgressTask> task = taskService.getTaskById(id);
        return task.map(t -> ResponseEntity.ok(toDTO(t))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgressTaskResponseDTO> update(@PathVariable UUID id, @RequestBody ProgressTaskRequestDTO dto) {
        Optional<ProgressTask> existingOpt = taskService.getTaskById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        ProgressTask task = existingOpt.get();
        task.setTaskName(dto.getTaskName());
        task.setDescription(dto.getDescription());
        task.setDueDays(dto.getDueDays());
        task.setDueDate(dto.getDueDate());
        if (dto.getPhaseId() != null) {
            Optional<ProgressPhase> phase = phaseRepository.findById(dto.getPhaseId());
            phase.ifPresent(task::setPhase);
        }
        if (dto.getMentorId() != null) {
            Optional<User> mentor = userRepository.findById(dto.getMentorId());
            mentor.ifPresent(task::setMentor);
        }
        ProgressTask updated = taskService.updateTask(task);
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    private ProgressTaskResponseDTO toDTO(ProgressTask entity) {
        ProgressTaskResponseDTO dto = new ProgressTaskResponseDTO();
        dto.setId(entity.getId());
        dto.setTaskName(entity.getTaskName());
        dto.setDescription(entity.getDescription());
        dto.setDueDays(entity.getDueDays());
        dto.setDueDate(entity.getDueDate());
        if (entity.getPhase() != null) {
            dto.setPhaseId(entity.getPhase().getId());
        }
        if (entity.getMentor() != null) {
            dto.setMentorId(entity.getMentor().getId());
        }
        return dto;
    }
} 