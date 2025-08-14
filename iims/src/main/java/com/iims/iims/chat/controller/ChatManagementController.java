package com.iims.iims.chat.controller;

import com.iims.iims.chat.dto.ChatRoomDto;
import com.iims.iims.chat.service.ChatManagementService;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat-management")
@CrossOrigin(origins = "*")
public class ChatManagementController {

    private final ChatManagementService chatManagementService;
    private final UserRepository userRepository;

    public ChatManagementController(ChatManagementService chatManagementService, UserRepository userRepository) {
        this.chatManagementService = chatManagementService;
        this.userRepository = userRepository;
    }

    /**
     * Create a group chat for all startups in a tenant
     */
    @PostMapping("/startup-group")
    public ResponseEntity<ChatRoomDto> createStartupGroupChat(
            @RequestParam UUID tenantId,
            @RequestParam(required = false) String chatName) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has permission
        if (!currentUser.getRole().name().equals("TENANT_ADMIN") && 
            !currentUser.getRole().name().equals("SUPER_ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        // Check if user has access to this tenant
        if (!currentUser.getTenantId().equals(tenantId) && 
            !currentUser.getRole().name().equals("SUPER_ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        try {
            var chatRoom = chatManagementService.createStartupGroupChat(tenantId, currentUser.getId(), chatName);
            return ResponseEntity.ok(convertToDto(chatRoom));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Create a group chat for all mentors in a tenant
     */
    @PostMapping("/mentor-group")
    public ResponseEntity<ChatRoomDto> createMentorGroupChat(
            @RequestParam UUID tenantId,
            @RequestParam(required = false) String chatName) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has permission
        if (!currentUser.getRole().name().equals("TENANT_ADMIN") && 
            !currentUser.getRole().name().equals("SUPER_ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        // Check if user has access to this tenant
        if (!currentUser.getTenantId().equals(tenantId) && 
            !currentUser.getRole().name().equals("SUPER_ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        try {
            var chatRoom = chatManagementService.createMentorGroupChat(tenantId, currentUser.getId(), chatName);
            return ResponseEntity.ok(convertToDto(chatRoom));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Create a cohort group chat
     */
    @PostMapping("/cohort-group")
    public ResponseEntity<ChatRoomDto> createCohortGroupChat(
            @RequestParam UUID tenantId,
            @RequestParam(required = false) String cohortName,
            @RequestParam(required = false) String industry) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has permission
        if (!currentUser.getRole().name().equals("TENANT_ADMIN") && 
            !currentUser.getRole().name().equals("SUPER_ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        // Check if user has access to this tenant
        if (!currentUser.getTenantId().equals(tenantId) && 
            !currentUser.getRole().name().equals("SUPER_ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        try {
            var chatRoom = chatManagementService.createCohortGroupChat(tenantId, currentUser.getId(), cohortName, industry);
            return ResponseEntity.ok(convertToDto(chatRoom));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all group chats for a tenant
     */
    @GetMapping("/group-chats/{tenantId}")
    public ResponseEntity<List<ChatRoomDto>> getTenantGroupChats(@PathVariable UUID tenantId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has access to this tenant
        if (!currentUser.getTenantId().equals(tenantId) && 
            !currentUser.getRole().name().equals("SUPER_ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        try {
            var chatRooms = chatManagementService.getTenantGroupChats(tenantId);
            List<ChatRoomDto> chatRoomDtos = chatRooms.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(chatRoomDtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all individual chats for a tenant
     */
    @GetMapping("/individual-chats/{tenantId}")
    public ResponseEntity<List<ChatRoomDto>> getTenantIndividualChats(@PathVariable UUID tenantId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has access to this tenant
        if (!currentUser.getTenantId().equals(tenantId) && 
            !currentUser.getRole().name().equals("SUPER_ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        try {
            var chatRooms = chatManagementService.getTenantIndividualChats(tenantId);
            List<ChatRoomDto> chatRoomDtos = chatRooms.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(chatRoomDtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private ChatRoomDto convertToDto(com.iims.iims.chat.entity.ChatRoom chatRoom) {
        ChatRoomDto dto = new ChatRoomDto();
        dto.setId(chatRoom.getId());
        dto.setChatName(chatRoom.getChatName());
        dto.setChatType(chatRoom.getChatType());
        dto.setTenantId(chatRoom.getTenantId());
        dto.setCreatedBy(chatRoom.getCreatedBy());
        dto.setCreatedAt(chatRoom.getCreatedAt());
        dto.setIsActive(chatRoom.getIsActive());
        
        // Convert users to UserSummaryDTO
        if (chatRoom.getUsers() != null) {
            dto.setUsers(chatRoom.getUsers().stream()
                .map(user -> {
                    var userDto = new com.iims.iims.mentorassignment.dto.UserSummaryDTO();
                    userDto.setId(user.getId());
                    userDto.setFullName(user.getFullName());
                    userDto.setEmail(user.getEmail());
                    return userDto;
                })
                .collect(Collectors.toSet()));
        }

        // TODO: Set unreadCount, lastMessage, lastMessageTime from ChatMessage service
        dto.setUnreadCount(0);
        dto.setLastMessage("");
        dto.setLastMessageTime(null);

        return dto;
    }
}
