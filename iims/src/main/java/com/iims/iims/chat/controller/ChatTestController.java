package com.iims.iims.chat.controller;

import com.iims.iims.chat.dto.ChatRoomDto;
import com.iims.iims.chat.service.ChatService;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat-test")
@CrossOrigin(origins = "*")
public class ChatTestController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    public ChatTestController(ChatService chatService, UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    /**
     * Test endpoint to create a simple chat room
     */
    @PostMapping("/create-test-chat")
    public ResponseEntity<String> createTestChat(
            @RequestParam UUID startupId,
            @RequestParam UUID mentorId,
            @RequestParam UUID tenantId) {
        
        try {
            // Check if users exist
            User startup = userRepository.findById(startupId)
                .orElseThrow(() -> new RuntimeException("Startup not found"));
            User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

            // Create chat room
            var chatRoom = chatService.createIndividualChatRoom(startupId, mentorId, tenantId);
            
            return ResponseEntity.ok("Chat room created successfully! ID: " + chatRoom.getId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating chat room: " + e.getMessage());
        }
    }

    /**
     * Test endpoint to get all users in a tenant
     */
    @GetMapping("/users/{tenantId}")
    public ResponseEntity<List<User>> getUsersInTenant(@PathVariable UUID tenantId) {
        try {
            List<User> users = userRepository.findByTenantId(tenantId);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Test endpoint to get all chat rooms
     */
    @GetMapping("/all-chats")
    public ResponseEntity<String> getAllChats() {
        try {
            var chatRooms = chatService.getAllChatRooms();
            return ResponseEntity.ok("Total chat rooms: " + chatRooms.size());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting chat rooms: " + e.getMessage());
        }
    }
}
