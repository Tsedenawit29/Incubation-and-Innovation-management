package com.iims.iims.chat.dto;

import com.iims.iims.chat.entity.ChatRoom;
import com.iims.iims.mentorassignment.dto.UserSummaryDTO;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
public class ChatRoomDto {
    private UUID id;
    private String chatName;
    private ChatRoom.ChatType chatType;
    private UUID tenantId;
    private UUID createdBy;
    private LocalDateTime createdAt;
    private boolean isActive;
    private Set<UserSummaryDTO> users;
    private int unreadCount;
    private String lastMessage;
    private LocalDateTime lastMessageTime;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getChatName() {
        return chatName;
    }

    public void setChatName(String chatName) {
        this.chatName = chatName;
    }

    public ChatRoom.ChatType getChatType() {
        return chatType;
    }

    public void setChatType(ChatRoom.ChatType chatType) {
        this.chatType = chatType;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public void setTenantId(UUID tenantId) {
        this.tenantId = tenantId;
    }

    public UUID getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UUID createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(boolean active) {
        isActive = active;
    }

    public Set<UserSummaryDTO> getUsers() {
        return users;
    }

    public void setUsers(Set<UserSummaryDTO> users) {
        this.users = users;
    }

    public int getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(int unreadCount) {
        this.unreadCount = unreadCount;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public LocalDateTime getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(LocalDateTime lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }
}
