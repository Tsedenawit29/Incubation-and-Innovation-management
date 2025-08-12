package com.iims.iims.chat.dto;

import com.iims.iims.chat.entity.ChatRoom;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
public class CreateChatRoomRequest {
    private String chatName;
    private ChatRoom.ChatType chatType;
    private UUID tenantId;
    private Set<UUID> userIds;
    private String description;
}
