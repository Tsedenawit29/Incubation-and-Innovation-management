package com.iims.iims.chat.dto;

import com.iims.iims.mentorassignment.dto.UserSummaryDTO;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ChatMessageDto {
    private UUID id;
    private String content;
    private LocalDateTime timestamp;
    private UserSummaryDTO sender;
}


