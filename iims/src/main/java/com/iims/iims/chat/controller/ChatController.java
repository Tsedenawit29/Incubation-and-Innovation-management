package com.iims.iims.chat.controller;

import com.iims.iims.chat.entity.ChatMessage;
import com.iims.iims.chat.entity.ChatRoom;
import com.iims.iims.chat.service.ChatService;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import com.iims.iims.chat.dto.ChatNotificationDto;
import com.iims.iims.chat.dto.ChatMessageDto;
import com.iims.iims.mentorassignment.dto.UserSummaryDTO;
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

            // Build lightweight DTO for WebSocket broadcast
            ChatMessageDto dto = new ChatMessageDto();
            dto.setId(saved.getId());
            dto.setContent(saved.getContent());
            dto.setTimestamp(saved.getTimestamp());
            if (saved.getSender() != null) {
                UserSummaryDTO u = new UserSummaryDTO();
                u.setId(saved.getSender().getId());
                u.setFullName(saved.getSender().getFullName());
                u.setEmail(saved.getSender().getEmail());
                dto.setSender(u);
            }
            // Broadcast to chat room subscribers
            messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId, dto);

            // Broadcast a lightweight room-level notification for left list counters
            ChatNotificationDto notif = new ChatNotificationDto();
            notif.setChatRoomId(chatRoomId);
            notif.setChatName(chatRoom.getChatName());
            notif.setSenderName(sender != null ? (sender.getFullName() != null ? sender.getFullName() : sender.getEmail()) : "");
            notif.setContentPreview(saved.getContent());
            notif.setTimestamp(saved.getTimestamp());
            messagingTemplate.convertAndSend("/topic/chat-notify/" + chatRoom.getTenantId(), notif);
        });
    }
}
