package com.iims.iims.mentorassignment.repository;

import com.iims.iims.mentorassignment.entity.StartupMentorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StartupMentorAssignmentRepository extends JpaRepository<StartupMentorAssignment, UUID> {
    List<StartupMentorAssignment> findByStartupId(UUID startupId);
    List<StartupMentorAssignment> findByMentorId(UUID mentorId);
    void deleteByStartupId(UUID startupId);
    void deleteByMentorId(UUID mentorId);
} 