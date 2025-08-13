package com.iims.iims.chat.controller;

import com.iims.iims.chat.entity.ChatMessage;
import com.iims.iims.chat.entity.ChatRoom;
import com.iims.iims.chat.service.ChatService;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

/**
 * Controller for handling WebSocket messages.
 * It receives messages from clients, saves them, and broadcasts them.
 */
@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final UserRepository userRepository;

    /**
     * Constructs the ChatController with the necessary dependencies.
     *
     * @param messagingTemplate The template for sending messages to clients.
     * @param chatService The service for handling chat business logic.
     */
    public ChatController(SimpMessagingTemplate messagingTemplate, ChatService chatService, UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    /**
     * Handles incoming group chat messages from clients.
     *
     * @param chatRoomId The UUID of the chat room.
     * @param chatMessage The message payload from the client.
     * @param principal The authenticated user principal.
     */
    @MessageMapping("/chat.sendMessage/{chatRoomId}")
    public void sendGroupMessage(@DestinationVariable UUID chatRoomId, @Payload ChatMessage chatMessage, Principal principal) {
        // Resolve sender and chat room
        User sender = userRepository.findByEmail(principal.getName()).orElse(null);
        chatService.getChatRoomById(chatRoomId).ifPresent(chatRoom -> {
            chatMessage.setChatRoom(chatRoom);
            if (sender != null) {
                chatMessage.setSender(sender);
            }

            // Persist and broadcast
            ChatMessage saved = chatService.saveMessage(chatMessage);
            messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId, saved);
        });
    }
}
