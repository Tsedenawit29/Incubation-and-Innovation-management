package com.iims.iims.notification.service;

import com.iims.iims.notification.dto.NotificationResponseDTO;
import com.iims.iims.meeting.entity.Meeting;
import com.iims.iims.meeting.repository.MeetingRepository;
import com.iims.iims.progresstracking.entity.ProgressSubmission;
import com.iims.iims.progresstracking.repository.ProgressSubmissionRepository;
import com.iims.iims.news.entity.NewsPost;
import com.iims.iims.news.repository.NewsPostRepository;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final MeetingRepository meetingRepository;
    private final ProgressSubmissionRepository submissionRepository;
    private final NewsPostRepository newsPostRepository;
    private final UserRepository userRepository;

    public List<NotificationResponseDTO> getNotificationsForUser(UUID userId, UUID tenantId) {
        List<NotificationResponseDTO> notifications = new ArrayList<>();
        
        try {
            // Add upcoming meetings notifications
            notifications.addAll(getUpcomingMeetingNotifications(userId));
        } catch (Exception e) {
            System.err.println("Error fetching meeting notifications: " + e.getMessage());
        }
        
        try {
            // Add progress submission feedback notifications
            notifications.addAll(getProgressFeedbackNotifications(userId));
        } catch (Exception e) {
            System.err.println("Error fetching feedback notifications: " + e.getMessage());
        }
        
        try {
            // Add recent news notifications
            notifications.addAll(getRecentNewsNotifications(tenantId));
        } catch (Exception e) {
            System.err.println("Error fetching news notifications: " + e.getMessage());
        }
        
        try {
            // Add sample notifications for testing
            notifications.addAll(getSampleNotifications(userId, tenantId));
        } catch (Exception e) {
            System.err.println("Error adding sample notifications: " + e.getMessage());
        }
        
        // Sort by creation time (most recent first)
        notifications.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        
        // Limit to most recent 20 notifications
        return notifications.stream().limit(20).collect(Collectors.toList());
    }

    public long getUnreadCount(UUID userId, UUID tenantId) {
        // For simplicity, we'll consider all notifications as unread for now
        // In a real implementation, you'd track read status in a database
        return getNotificationsForUser(userId, tenantId).size();
    }

    public void markAsRead(UUID notificationId, UUID userId) {
        // In a real implementation, you'd update the read status in a database
        // For now, this is a placeholder
    }

    private List<NotificationResponseDTO> getUpcomingMeetingNotifications(UUID userId) {
        List<NotificationResponseDTO> notifications = new ArrayList<>();
        
        try {
            // Get meetings where user is organizer or attendee in the next 24 hours
            List<Meeting> allMeetings = meetingRepository.findAll();
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime tomorrow = now.plusDays(1);
            
            for (Meeting meeting : allMeetings) {
                if (meeting.getStartTime() != null) {
                    LocalDateTime meetingStart = LocalDateTime.ofInstant(meeting.getStartTime(), 
                        java.time.ZoneId.systemDefault());
                    
                    // Check if meeting is in next 24 hours and user is involved
                    if (meetingStart.isAfter(now) && meetingStart.isBefore(tomorrow)) {
                        boolean isInvolved = false;
                        
                        // Check if user is organizer
                        if (meeting.getOrganizer() != null && meeting.getOrganizer().getId().equals(userId)) {
                            isInvolved = true;
                        }
                        
                        // Check if user is attendee
                        if (meeting.getAttendees() != null) {
                            for (User attendee : meeting.getAttendees()) {
                                if (attendee.getId().equals(userId)) {
                                    isInvolved = true;
                                    break;
                                }
                            }
                        }
                        
                        if (isInvolved) {
                            notifications.add(NotificationResponseDTO.builder()
                                .id(UUID.randomUUID())
                                .type("meeting")
                                .title("Upcoming Meeting")
                                .message("Meeting '" + meeting.getTitle() + "' starts soon")
                                .icon("calendar")
                                .isRead(false)
                                .createdAt(now)
                                .relativeTime(getRelativeTime(now))
                                .actionUrl("/calendar")
                                .priority("HIGH")
                                .build());
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error in getUpcomingMeetingNotifications: " + e.getMessage());
        }
        
        return notifications;
    }

    private List<NotificationResponseDTO> getProgressFeedbackNotifications(UUID userId) {
        List<NotificationResponseDTO> notifications = new ArrayList<>();
        
        // Get recent submissions with feedback (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        
        // Get recent submissions with feedback
        try {
            List<ProgressSubmission> recentSubmissions = submissionRepository
                .findBySubmittedAtAfterAndMentorFeedbackIsNotNull(weekAgo);
            
            for (ProgressSubmission submission : recentSubmissions) {
                notifications.add(NotificationResponseDTO.builder()
                    .id(UUID.randomUUID())
                    .type("feedback")
                    .title("New Feedback Received")
                    .message("Your mentor provided feedback on your submission")
                    .icon("message-circle")
                    .isRead(false)
                    .createdAt(submission.getSubmittedAt())
                    .relativeTime(getRelativeTime(submission.getSubmittedAt()))
                    .actionUrl("/progress")
                    .priority("MEDIUM")
                    .build());
            }
        } catch (Exception e) {
            System.err.println("Error fetching feedback notifications: " + e.getMessage());
        }
        
        return notifications;
    }

    private List<NotificationResponseDTO> getRecentNewsNotifications(UUID tenantId) {
        List<NotificationResponseDTO> notifications = new ArrayList<>();
        
        if (tenantId == null) return notifications;
        
        // Get news posts from the last 3 days
        try {
            LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);
            
            List<NewsPost> recentNews = newsPostRepository.findAll().stream()
                .filter(news -> news.getTenant() != null && news.getTenant().getId().equals(tenantId))
                .filter(news -> news.getPublishedAt().isAfter(threeDaysAgo))
                .sorted((a, b) -> b.getPublishedAt().compareTo(a.getPublishedAt()))
                .limit(3)
                .collect(Collectors.toList());
            
            for (NewsPost news : recentNews) {
                notifications.add(NotificationResponseDTO.builder()
                    .id(UUID.randomUUID())
                    .type("news")
                    .title("New Announcement")
                    .message(news.getTitle())
                    .icon("megaphone")
                    .isRead(false)
                    .createdAt(news.getPublishedAt())
                    .relativeTime(getRelativeTime(news.getPublishedAt()))
                    .actionUrl("/dashboard")
                    .priority("LOW")
                    .build());
            }
        } catch (Exception e) {
            System.err.println("Error fetching news notifications: " + e.getMessage());
        }
        
        return notifications;
    }

    private List<NotificationResponseDTO> getOverdueTaskNotifications(UUID userId) {
        List<NotificationResponseDTO> notifications = new ArrayList<>();
        
        // This is a placeholder for overdue task logic
        // You would implement this based on your progress tracking system
        LocalDateTime now = LocalDateTime.now();
        
        // Example: Check for overdue submissions
        // This would need to be implemented based on your actual task/deadline system
        
        return notifications;
    }

    private List<NotificationResponseDTO> getSampleNotifications(UUID userId, UUID tenantId) {
        List<NotificationResponseDTO> notifications = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        // Add sample meeting notification
        notifications.add(NotificationResponseDTO.builder()
            .id(UUID.randomUUID())
            .type("meeting")
            .title("Upcoming Meeting")
            .message("Weekly mentorship session scheduled for tomorrow at 2:00 PM")
            .icon("calendar")
            .isRead(false)
            .createdAt(now.minusHours(2))
            .relativeTime("2 hours ago")
            .actionUrl("/calendar")
            .priority("HIGH")
            .build());
            
        // Add sample feedback notification
        notifications.add(NotificationResponseDTO.builder()
            .id(UUID.randomUUID())
            .type("feedback")
            .title("New Feedback Received")
            .message("Your mentor provided feedback on your latest submission")
            .icon("message-circle")
            .isRead(false)
            .createdAt(now.minusHours(6))
            .relativeTime("6 hours ago")
            .actionUrl("/progress")
            .priority("MEDIUM")
            .build());
            
        // Add sample news notification
        notifications.add(NotificationResponseDTO.builder()
            .id(UUID.randomUUID())
            .type("news")
            .title("New Announcement")
            .message("New funding opportunity available for innovative startups")
            .icon("megaphone")
            .isRead(false)
            .createdAt(now.minusDays(1))
            .relativeTime("1 day ago")
            .actionUrl("/dashboard")
            .priority("LOW")
            .build());
            
        // Add sample system notification
        notifications.add(NotificationResponseDTO.builder()
            .id(UUID.randomUUID())
            .type("system")
            .title("Progress Update")
            .message("Your Q3 progress report is due next week")
            .icon("bell")
            .isRead(false)
            .createdAt(now.minusDays(2))
            .relativeTime("2 days ago")
            .actionUrl("/progress")
            .priority("MEDIUM")
            .build());
            
        return notifications;
    }

    private String getRelativeTime(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        long days = ChronoUnit.DAYS.between(dateTime, now);
        
        if (minutes < 60) {
            return minutes <= 1 ? "1 minute ago" : minutes + " minutes ago";
        } else if (hours < 24) {
            return hours == 1 ? "1 hour ago" : hours + " hours ago";
        } else {
            return days == 1 ? "1 day ago" : days + " days ago";
        }
    }
}
