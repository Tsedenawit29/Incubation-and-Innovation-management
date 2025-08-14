package com.iims.iims.notification.controller;

import com.iims.iims.notification.dto.NotificationResponseDTO;
import com.iims.iims.notification.service.NotificationService;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getNotificationsForUser(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<NotificationResponseDTO> notifications = notificationService.getNotificationsForUser(user.getId(), user.getTenantId());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        long count = notificationService.getUnreadCount(user.getId(), user.getTenantId());
        return ResponseEntity.ok(count);
    }

    @PostMapping("/{notificationId}/mark-read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID notificationId, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        notificationService.markAsRead(notificationId, user.getId());
        return ResponseEntity.ok().build();
    }
}
