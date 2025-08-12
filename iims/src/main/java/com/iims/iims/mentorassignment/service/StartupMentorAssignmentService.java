package com.iims.iims.mentorassignment.service;

import com.iims.iims.chat.service.ChatService;
import com.iims.iims.mentorassignment.entity.StartupMentorAssignment;
import com.iims.iims.mentorassignment.repository.StartupMentorAssignmentRepository;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class StartupMentorAssignmentService {
    @Autowired
    private StartupMentorAssignmentRepository assignmentRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private ChatService chatService;

    public StartupMentorAssignment assignMentor(UUID startupId, UUID mentorId) {
        Optional<User> startup = userRepo.findById(startupId);
        Optional<User> mentor = userRepo.findById(mentorId);
        if (startup.isEmpty() || mentor.isEmpty()) throw new IllegalArgumentException("Invalid user IDs");
        
        StartupMentorAssignment assignment = new StartupMentorAssignment();
        assignment.setId(UUID.randomUUID());
        assignment.setStartup(startup.get());
        assignment.setMentor(mentor.get());
        assignment.setAssignedAt(LocalDateTime.now());
        
        StartupMentorAssignment savedAssignment = assignmentRepo.save(assignment);
        
        // Automatically create a chat room for the startup-mentor pair
        try {
            chatService.createIndividualChatRoom(startupId, mentorId, startup.get().getTenantId());
        } catch (Exception e) {
            // Log the error but don't fail the assignment
            System.err.println("Failed to create chat room for startup " + startupId + " and mentor " + mentorId + ": " + e.getMessage());
        }
        
        return savedAssignment;
    }

    public List<StartupMentorAssignment> getMentorsForStartup(UUID startupId) {
        return assignmentRepo.findByStartupId(startupId);
    }

    public List<StartupMentorAssignment> getStartupsForMentor(UUID mentorId) {
        return assignmentRepo.findByMentorId(mentorId);
    }

    public void unassignMentor(UUID startupId, UUID mentorId) {
        List<StartupMentorAssignment> assignments = assignmentRepo.findByStartupId(startupId);
        for (StartupMentorAssignment assignment : assignments) {
            if (assignment.getMentor() != null && assignment.getMentor().getId().equals(mentorId)) {
                assignmentRepo.delete(assignment);
            }
        }
    }
} 