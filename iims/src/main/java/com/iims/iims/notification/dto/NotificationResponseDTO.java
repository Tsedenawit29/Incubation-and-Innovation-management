package com.iims.iims.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {
    private UUID id;
    private String type;
    private String title;
    private String message;
    private String icon;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String relativeTime;
    private String actionUrl;
    private String priority; // HIGH, MEDIUM, LOW
}
