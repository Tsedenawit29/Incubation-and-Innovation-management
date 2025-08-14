package com.iims.iims.meeting.repository;

import com.iims.iims.meeting.entity.Meeting;
import com.iims.iims.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface MeetingRepository extends JpaRepository<Meeting, UUID> {
    List<Meeting> findByOrganizer(User organizer);
}
