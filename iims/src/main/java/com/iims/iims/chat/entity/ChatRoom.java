package com.iims.iims.chat.entity;

import com.iims.iims.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "chat_rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "room_id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "chat_name", nullable = false)
    private String chatName;

    @Column(name = "chat_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ChatType chatType;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "is_active")
    private boolean isActive = true;

    @ManyToMany
    @JoinTable(
        name = "chat_room_users", 
        joinColumns = @JoinColumn(name = "room_id"), 
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> users;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }


    public enum ChatType {
        INDIVIDUAL,    // One-on-one chat between startup and mentor
        GROUP,         // Group chat created by tenant admin
        SUPPORT        // Support chat between user and tenant admin
    }

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

    public ChatType getChatType() {
        return chatType;
    }

    public void setChatType(ChatType chatType) {
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

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }
}