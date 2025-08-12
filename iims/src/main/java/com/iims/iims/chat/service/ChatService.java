package com.iims.iims.chat.service;

import com.iims.iims.chat.entity.ChatMessage;
import com.iims.iims.chat.entity.ChatRoom;
import com.iims.iims.chat.repo.ChatMessageRepository;
import com.iims.iims.chat.repo.ChatRoomRepository;
import com.iims.iims.mentorassignment.entity.StartupMentorAssignment;
import com.iims.iims.mentorassignment.repository.StartupMentorAssignmentRepository;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class for handling chat-related business logic.
 * This class manages the saving of messages and the retrieval of chat history.
 */
@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final StartupMentorAssignmentRepository mentorAssignmentRepository;

    /**
     * Constructs the ChatService with necessary repository dependencies.
     */
    public ChatService(ChatMessageRepository chatMessageRepository, 
                      ChatRoomRepository chatRoomRepository,
                      UserRepository userRepository,
                      StartupMentorAssignmentRepository mentorAssignmentRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.userRepository = userRepository;
        this.mentorAssignmentRepository = mentorAssignmentRepository;
    }

    /**
     * Saves a new message to the database.
     */
    public ChatMessage saveMessage(ChatMessage chatMessage) {
        chatMessage.setTimestamp(LocalDateTime.now());
        return chatMessageRepository.save(chatMessage);
    }

    /**
     * Retrieves the chat history for a specific chat room.
     */
    public List<ChatMessage> getChatHistory(UUID chatRoomId) {
        return chatMessageRepository.findByChatRoomIdOrderByTimestampAsc(chatRoomId);
    }

    /**
     * Creates a new individual chat room between a startup and mentor.
     */
    public ChatRoom createIndividualChatRoom(UUID startupId, UUID mentorId, UUID tenantId) {
        // Check if chat room already exists
        Optional<ChatRoom> existingRoom = chatRoomRepository.findIndividualChatRoom(startupId, mentorId, tenantId);
        if (existingRoom.isPresent()) {
            return existingRoom.get();
        }

        // Get users
        User startup = userRepository.findById(startupId)
            .orElseThrow(() -> new RuntimeException("Startup not found"));
        User mentor = userRepository.findById(mentorId)
            .orElseThrow(() -> new RuntimeException("Mentor not found"));

        // Create new chat room
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setChatName(startup.getFullName() + " & " + mentor.getFullName());
        chatRoom.setChatType(ChatRoom.ChatType.INDIVIDUAL);
        chatRoom.setTenantId(tenantId);
        chatRoom.setCreatedBy(mentorId);
        chatRoom.setUsers(Set.of(startup, mentor));
        chatRoom.setIsActive(true);

        return chatRoomRepository.save(chatRoom);
    }

    /**
     * Creates a new group chat room.
     */
    public ChatRoom createGroupChatRoom(String chatName, Set<UUID> userIds, UUID tenantId, UUID createdBy) {
        // Get users
        Set<User> users = userIds.stream()
            .map(id -> userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id)))
            .collect(Collectors.toSet());

        // Create new chat room
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setChatName(chatName);
        chatRoom.setChatType(ChatRoom.ChatType.GROUP);
        chatRoom.setTenantId(tenantId);
        chatRoom.setCreatedBy(createdBy);
        chatRoom.setUsers(users);
        chatRoom.setIsActive(true);

        return chatRoomRepository.save(chatRoom);
    }

    /**
     * Gets or creates an individual chat room between startup and mentor.
     */
    public ChatRoom getOrCreateIndividualChatRoom(UUID startupId, UUID mentorId, UUID tenantId) {
        return chatRoomRepository.findIndividualChatRoom(startupId, mentorId, tenantId)
            .orElseGet(() -> createIndividualChatRoom(startupId, mentorId, tenantId));
    }

    /**
     * Gets all chat rooms for a user in a specific tenant.
     */
    public List<ChatRoom> getUserChatRooms(UUID userId, UUID tenantId) {
        return chatRoomRepository.findByTenantIdAndUserId(tenantId, userId);
    }

    /**
     * Gets all chat rooms for a tenant.
     */
    public List<ChatRoom> getTenantChatRooms(UUID tenantId) {
        return chatRoomRepository.findByTenantId(tenantId);
    }

    /**
     * Gets chat rooms by type for a tenant.
     */
    public List<ChatRoom> getChatRoomsByType(ChatRoom.ChatType chatType, UUID tenantId) {
        return chatRoomRepository.findByChatTypeAndTenantId(chatType, tenantId);
    }

    /**
     * Creates individual chat rooms for all startup-mentor assignments in a tenant.
     */
    public void createIndividualChatRoomsForTenant(UUID tenantId) {
        // This would need to be implemented based on your mentor assignment logic
        // For now, this is a placeholder
    }

    /**
     * Deactivates a chat room.
     */
    public ChatRoom deactivateChatRoom(UUID chatRoomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow(() -> new RuntimeException("Chat room not found"));
        chatRoom.setIsActive(false);
        return chatRoomRepository.save(chatRoom);
    }

    /**
     * Gets a chat room by ID.
     */
    public Optional<ChatRoom> getChatRoomById(UUID chatRoomId) {
        return chatRoomRepository.findById(chatRoomId);
    }

    /**
     * Gets all chat rooms (for testing purposes)
     */
    public List<ChatRoom> getAllChatRooms() {
        return chatRoomRepository.findAll();
    }
}
