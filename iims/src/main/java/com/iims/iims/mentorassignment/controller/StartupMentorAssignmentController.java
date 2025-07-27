package com.iims.iims.mentorassignment.controller;

import com.iims.iims.mentorassignment.dto.StartupMentorAssignmentRequestDTO;
import com.iims.iims.mentorassignment.dto.StartupMentorAssignmentResponseDTO;
import com.iims.iims.mentorassignment.dto.UserSummaryDTO;
import com.iims.iims.mentorassignment.entity.StartupMentorAssignment;
import com.iims.iims.mentorassignment.service.StartupMentorAssignmentService;
import com.iims.iims.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mentor-assignment")
public class StartupMentorAssignmentController {
    @Autowired
    private StartupMentorAssignmentService assignmentService;

    @PostMapping
    public ResponseEntity<StartupMentorAssignmentResponseDTO> assignMentor(@RequestBody StartupMentorAssignmentRequestDTO dto) {
        StartupMentorAssignment assignment = assignmentService.assignMentor(dto.getStartupId(), dto.getMentorId());
        return ResponseEntity.ok(toDTO(assignment));
    }

    @GetMapping(params = "startupId")
    public ResponseEntity<List<StartupMentorAssignmentResponseDTO>> getMentorsForStartup(@RequestParam UUID startupId) {
        List<StartupMentorAssignment> assignments = assignmentService.getMentorsForStartup(startupId);
        List<StartupMentorAssignmentResponseDTO> dtos = assignments.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping(params = "mentorId")
    public ResponseEntity<List<StartupMentorAssignmentResponseDTO>> getStartupsForMentor(@RequestParam UUID mentorId) {
        List<StartupMentorAssignment> assignments = assignmentService.getStartupsForMentor(mentorId);
        List<StartupMentorAssignmentResponseDTO> dtos = assignments.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping
    public ResponseEntity<Void> unassignMentor(@RequestParam UUID startupId, @RequestParam UUID mentorId) {
        assignmentService.unassignMentor(startupId, mentorId);
        return ResponseEntity.noContent().build();
    }

    private StartupMentorAssignmentResponseDTO toDTO(StartupMentorAssignment entity) {
        StartupMentorAssignmentResponseDTO dto = new StartupMentorAssignmentResponseDTO();
        dto.setId(entity.getId());
        dto.setAssignedAt(entity.getAssignedAt());

        if (entity.getStartup() != null) {
            dto.setStartup(toUserSummaryDTO(entity.getStartup()));
        }
        if (entity.getMentor() != null) {
            dto.setMentor(toUserSummaryDTO(entity.getMentor()));
        }

        return dto;
    }

    private UserSummaryDTO toUserSummaryDTO(User user) {
        if (user == null) return null;
        UserSummaryDTO dto = new UserSummaryDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        return dto;
    }
} 