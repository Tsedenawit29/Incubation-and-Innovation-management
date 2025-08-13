package com.iims.iims.chat.service;

import com.iims.iims.chat.entity.ChatMessage;
import com.iims.iims.chat.entity.ChatRoom;
import com.iims.iims.chat.repo.ChatMessageRepository;
import com.iims.iims.chat.repo.ChatRoomRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service class for handling chat-related business logic.
 * This class manages the saving of messages and the retrieval of chat history.
 */
@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;

    /**
     * Constructs the ChatService with necessary repository dependencies.
     *
     * @param chatMessageRepository The repository for chat message persistence.
     * @param chatRoomRepository The repository for chat room persistence.
     */
    public ChatService(ChatMessageRepository chatMessageRepository, ChatRoomRepository chatRoomRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.chatRoomRepository = chatRoomRepository;
    }

    /**
     * Saves a new message to the database.
     * Before saving, it sets the current timestamp for the message.
     *
     * @param chatMessage The ChatMessage entity to be saved.
     * @return The saved ChatMessage entity.
     */
    public ChatMessage saveMessage(ChatMessage chatMessage) {
        chatMessage.setTimestamp(LocalDateTime.now());
        return chatMessageRepository.save(chatMessage);
    }

    /**
     * Retrieves the chat history for a specific chat room.
     * Messages are returned in ascending order of their timestamp.
     *
     * @param chatRoomId The UUID of the chat room.
     * @return A list of ChatMessage entities for the given chat room.
     */
    public List<ChatMessage> getChatHistory(UUID chatRoomId) {
        return chatMessageRepository.findByChatRoomIdOrderByTimestampAsc(chatRoomId);
    }

    /**
     * Retrieves an existing chat room or creates a new one if it doesn't exist.
     * This is a simplified example and would contain more complex logic in a real application.
     *
     * @param user1Id The UUID of the first user.
     * @param user2Id The UUID of the second user.
     * @return The existing or newly created ChatRoom.
     */
    public ChatRoom getOrCreateChatRoom(UUID user1Id, UUID user2Id) {
        // Here you would implement logic to check for an existing chat room.
        // For example, by checking if a room with these two users already exists.
        // If it doesn't, you would create a new ChatRoom, add the users, and save it.
        ChatRoom newRoom = new ChatRoom();
        return chatRoomRepository.save(newRoom);
    }
}
