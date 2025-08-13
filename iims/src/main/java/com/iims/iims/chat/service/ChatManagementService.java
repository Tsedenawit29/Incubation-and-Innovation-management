package com.iims.iims.chat.service;

import com.iims.iims.chat.entity.ChatRoom;
import com.iims.iims.chat.repo.ChatRoomRepository;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChatManagementService {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;

    public ChatManagementService(ChatService chatService, UserRepository userRepository, ChatRoomRepository chatRoomRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
        this.chatRoomRepository = chatRoomRepository;
    }

    /**
     * Creates a group chat for all startups in a tenant
     */
    public ChatRoom createStartupGroupChat(UUID tenantId, UUID createdBy, String chatName) {
        // Get all startup users in the tenant
        List<User> startupUsers = userRepository.findByTenantIdAndRole(tenantId, com.iims.iims.user.entity.Role.STARTUP);
        
        if (startupUsers.isEmpty()) {
            throw new RuntimeException("No startup users found in tenant");
        }

        Set<UUID> startupIds = startupUsers.stream()
            .map(User::getId)
            .collect(Collectors.toSet());

        return chatService.createGroupChatRoom(
            chatName != null ? chatName : "Startup Community",
            startupIds,
            tenantId,
            createdBy
        );
    }

    /**
     * Creates a group chat for all mentors in a tenant
     */
    public ChatRoom createMentorGroupChat(UUID tenantId, UUID createdBy, String chatName) {
        // Get all mentor users in the tenant
        List<User> mentorUsers = userRepository.findByTenantIdAndRole(tenantId, com.iims.iims.user.entity.Role.MENTOR);
        
        if (mentorUsers.isEmpty()) {
            throw new RuntimeException("No mentor users found in tenant");
        }

        Set<UUID> mentorIds = mentorUsers.stream()
            .map(User::getId)
            .collect(Collectors.toSet());

        return chatService.createGroupChatRoom(
            chatName != null ? chatName : "Mentor Community",
            mentorIds,
            tenantId,
            createdBy
        );
    }

    /**
     * Creates a group chat for startups and mentors in a specific cohort or industry
     */
    public ChatRoom createCohortGroupChat(UUID tenantId, UUID createdBy, String cohortName, String industry) {
        // This would need to be implemented based on your cohort/industry logic
        // For now, we'll create a general startup-mentor group chat
        List<User> startupUsers = userRepository.findByTenantIdAndRole(tenantId, com.iims.iims.user.entity.Role.STARTUP);
        List<User> mentorUsers = userRepository.findByTenantIdAndRole(tenantId, com.iims.iims.user.entity.Role.MENTOR);
        
        Set<UUID> allUserIds = new java.util.HashSet<>();
        startupUsers.forEach(user -> allUserIds.add(user.getId()));
        mentorUsers.forEach(user -> allUserIds.add(user.getId()));

        String chatName = cohortName != null ? 
            (industry != null ? cohortName + " - " + industry : cohortName) :
            (industry != null ? industry + " Community" : "Startup-Mentor Community");

        return chatService.createGroupChatRoom(chatName, allUserIds, tenantId, createdBy);
    }

    /**
     * Adds users to an existing group chat
     */
    public ChatRoom addUsersToGroupChat(UUID chatRoomId, Set<UUID> userIds) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow(() -> new RuntimeException("Chat room not found"));

        if (chatRoom.getChatType() != ChatRoom.ChatType.GROUP) {
            throw new RuntimeException("Can only add users to group chats");
        }

        Set<User> newUsers = userIds.stream()
            .map(id -> userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id)))
            .collect(Collectors.toSet());

        // Add new users to existing users
        chatRoom.getUsers().addAll(newUsers);
        
        return chatRoomRepository.save(chatRoom);
    }

    /**
     * Removes users from a group chat
     */
    public ChatRoom removeUsersFromGroupChat(UUID chatRoomId, Set<UUID> userIds) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow(() -> new RuntimeException("Chat room not found"));

        if (chatRoom.getChatType() != ChatRoom.ChatType.GROUP) {
            throw new RuntimeException("Can only remove users from group chats");
        }

        // Remove users by ID
        chatRoom.setUsers(chatRoom.getUsers().stream()
            .filter(user -> !userIds.contains(user.getId()))
            .collect(Collectors.toSet()));

        return chatRoomRepository.save(chatRoom);
    }

    /**
     * Gets all group chats for a tenant
     */
    public List<ChatRoom> getTenantGroupChats(UUID tenantId) {
        return chatRoomRepository.findByChatTypeAndTenantId(ChatRoom.ChatType.GROUP, tenantId);
    }

    /**
     * Gets all individual chats for a tenant
     */
    public List<ChatRoom> getTenantIndividualChats(UUID tenantId) {
        return chatRoomRepository.findByChatTypeAndTenantId(ChatRoom.ChatType.INDIVIDUAL, tenantId);
    }
}
