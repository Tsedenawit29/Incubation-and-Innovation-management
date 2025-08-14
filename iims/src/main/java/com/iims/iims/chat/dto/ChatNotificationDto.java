package com.iims.iims.chat.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ChatNotificationDto {
    private UUID chatRoomId;
    private String chatName;
    private String senderName;
    private String contentPreview;
    private LocalDateTime timestamp;
}


