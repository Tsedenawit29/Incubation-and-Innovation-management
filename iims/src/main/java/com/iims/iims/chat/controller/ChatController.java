package com.iims.iims.chat.controller;

import com.iims.iims.chat.entity.ChatMessage;
import com.iims.iims.chat.service.ChatService;
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

    /**
     * Constructs the ChatController with the necessary dependencies.
     *
     * @param messagingTemplate The template for sending messages to clients.
     * @param chatService The service for handling chat business logic.
     */
    public ChatController(SimpMessagingTemplate messagingTemplate, ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
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
        // Set the sender from the authenticated user
        // chatMessage.setSender(userService.findByUsername(principal.getName()));

        // Set the chat room from the path variable
        // chatMessage.setChatRoom(chatRoomService.findById(chatRoomId));

        // Save the message to the database using the service
        chatService.saveMessage(chatMessage);

        // Broadcast the message to all clients subscribed to this chat room
        messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId, chatMessage);
    }
}
