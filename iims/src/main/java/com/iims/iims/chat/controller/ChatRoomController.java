package com.iims.iims.chat.controller;

import com.iims.iims.chat.dto.ChatRoomDto;
import com.iims.iims.chat.dto.ChatMessageDto;
import com.iims.iims.chat.dto.CreateChatRoomRequest;
import com.iims.iims.chat.entity.ChatRoom;
import com.iims.iims.chat.service.ChatService;
import com.iims.iims.mentorassignment.dto.UserSummaryDTO;
import com.iims.iims.mentorassignment.repository.StartupMentorAssignmentRepository;
import com.iims.iims.user.entity.Role;
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
@RequestMapping("/api/chat-rooms")
@CrossOrigin(origins = "*")
public class ChatRoomController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final StartupMentorAssignmentRepository startupMentorAssignmentRepository;

    public ChatRoomController(ChatService chatService, UserRepository userRepository, StartupMentorAssignmentRepository startupMentorAssignmentRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
        this.startupMentorAssignmentRepository = startupMentorAssignmentRepository;
    }

    /**
     * Get all chat rooms for the current user in their tenant
     */
    @GetMapping
    public ResponseEntity<List<ChatRoomDto>> getUserChatRooms() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<ChatRoom> chatRooms = chatService.getUserChatRooms(currentUser.getId(), currentUser.getTenantId());
        List<ChatRoomDto> chatRoomDtos = chatRooms.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());

        return ResponseEntity.ok(chatRoomDtos);
    }

    /**
     * Get all chat rooms for a specific tenant (for tenant admins)
     */
    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<ChatRoomDto>> getTenantChatRooms(@PathVariable UUID tenantId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has access to this tenant
        if (!currentUser.getTenantId().equals(tenantId) && 
            !currentUser.getRole().name().equals("SUPER_ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        List<ChatRoom> chatRooms = chatService.getTenantChatRooms(tenantId);
        List<ChatRoomDto> chatRoomDtos = chatRooms.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());

        return ResponseEntity.ok(chatRoomDtos);
    }

    /**
     * Create a new group chat room
     */
    @PostMapping
    public ResponseEntity<ChatRoomDto> createChatRoom(@RequestBody CreateChatRoomRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has permission to create chat rooms
        if (!currentUser.getRole().name().equals("TENANT_ADMIN") && 
            !currentUser.getRole().name().equals("SUPER_ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        ChatRoom chatRoom = chatService.createGroupChatRoom(
            request.getChatName(),
            request.getUserIds(),
            request.getTenantId(),
            currentUser.getId()
        );

        return ResponseEntity.ok(convertToDto(chatRoom));
    }

    /**
     * Create or get individual chat room between startup and mentor
     */
    @PostMapping("/individual")
    public ResponseEntity<ChatRoomDto> createIndividualChatRoom(
            @RequestParam UUID startupId,
            @RequestParam UUID mentorId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Get startup and mentor users
        User startup = userRepository.findById(startupId)
            .orElseThrow(() -> new RuntimeException("Startup not found"));
        User mentor = userRepository.findById(mentorId)
            .orElseThrow(() -> new RuntimeException("Mentor not found"));

        // Check if current user has access to create this chat
        if (!currentUser.getId().equals(startupId) && 
            !currentUser.getId().equals(mentorId) &&
            !currentUser.getRole().name().equals("TENANT_ADMIN") &&
            !currentUser.getRole().name().equals("SUPER_ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        ChatRoom chatRoom = chatService.getOrCreateIndividualChatRoom(
            startupId, mentorId, startup.getTenantId());

        return ResponseEntity.ok(convertToDto(chatRoom));
    }

    /**
     * Create or get individual chat room with a user in the same tenant by their email
     */
    @PostMapping("/individual/by-email")
    public ResponseEntity<ChatRoomDto> createIndividualChatRoomByEmail(@RequestParam String email) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getEmail().equalsIgnoreCase(email)) {
            return ResponseEntity.badRequest().build();
        }

        User other = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Target user not found"));

        if (other.getTenantId() == null || currentUser.getTenantId() == null || !other.getTenantId().equals(currentUser.getTenantId())) {
            return ResponseEntity.status(403).build();
        }

        ChatRoom chatRoom = chatService.getOrCreateIndividualChatRoom(currentUser.getId(), other.getId(), currentUser.getTenantId());
        return ResponseEntity.ok(convertToDto(chatRoom));
    }

    /**
     * Get quick contacts for the current user: assigned counterpart(s) and tenant admins
     */
    @GetMapping("/contacts")
    public ResponseEntity<List<UserSummaryDTO>> getContacts() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Assigned counterparts based on role
        List<User> assigned;
        if (currentUser.getRole() == Role.STARTUP) {
            assigned = startupMentorAssignmentRepository.findByStartupId(currentUser.getId())
                .stream()
                .map(a -> a.getMentor())
                .collect(Collectors.toList());
        } else if (currentUser.getRole() == Role.MENTOR) {
            assigned = startupMentorAssignmentRepository.findByMentorId(currentUser.getId())
                .stream()
                .map(a -> a.getStartup())
                .collect(Collectors.toList());
        } else {
            assigned = List.of();
        }

        // Tenant admins
        List<User> tenantAdmins = userRepository.findByTenantIdAndRole(currentUser.getTenantId(), Role.TENANT_ADMIN);

        // Combine and distinct by id, excluding current user
        List<UserSummaryDTO> result = java.util.stream.Stream.concat(assigned.stream(), tenantAdmins.stream())
            .filter(u -> !u.getId().equals(currentUser.getId()))
            .collect(java.util.stream.Collectors.collectingAndThen(
                java.util.stream.Collectors.toMap(User::getId, u -> u, (a, b) -> a, java.util.LinkedHashMap::new),
                map -> map.values().stream().map(this::toUserSummary).collect(java.util.stream.Collectors.toList())
            ));

        return ResponseEntity.ok(result);
    }

    /**
     * Search users in the same tenant by email or name (contains, case-insensitive)
     */
    @GetMapping("/tenant-users")
    public ResponseEntity<List<UserSummaryDTO>> searchTenantUsers(@RequestParam(name = "q", required = false) String query) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<User> users = userRepository.findByTenantId(currentUser.getTenantId());
        String q = query == null ? "" : query.trim().toLowerCase();
        List<UserSummaryDTO> result = users.stream()
            .filter(u -> !u.getId().equals(currentUser.getId()))
            .filter(u -> q.isEmpty() ||
                (u.getEmail() != null && u.getEmail().toLowerCase().contains(q)) ||
                (u.getFullName() != null && u.getFullName().toLowerCase().contains(q)))
            .limit(20)
            .map(this::toUserSummary)
            .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Get chat room by ID
     */
    @GetMapping("/{chatRoomId}")
    public ResponseEntity<ChatRoomDto> getChatRoom(@PathVariable UUID chatRoomId) {
        ChatRoom chatRoom = chatService.getChatRoomById(chatRoomId)
            .orElseThrow(() -> new RuntimeException("Chat room not found"));

        return ResponseEntity.ok(convertToDto(chatRoom));
    }

    /**
     * Get chat history for a room (ordered by timestamp)
     */
    @GetMapping("/{chatRoomId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getChatMessages(@PathVariable UUID chatRoomId) {
        var messages = chatService.getChatHistory(chatRoomId);
        List<ChatMessageDto> dtos = messages.stream().map(m -> {
            ChatMessageDto dto = new ChatMessageDto();
            dto.setId(m.getId());
            dto.setContent(m.getContent());
            dto.setTimestamp(m.getTimestamp());
            if (m.getSender() != null) {
                UserSummaryDTO u = new UserSummaryDTO();
                u.setId(m.getSender().getId());
                u.setFullName(m.getSender().getFullName());
                u.setEmail(m.getSender().getEmail());
                dto.setSender(u);
            }
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Deactivate a chat room
     */
    @DeleteMapping("/{chatRoomId}")
    public ResponseEntity<Void> deactivateChatRoom(@PathVariable UUID chatRoomId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        ChatRoom chatRoom = chatService.getChatRoomById(chatRoomId)
            .orElseThrow(() -> new RuntimeException("Chat room not found"));

        // Check if user has permission to deactivate
        if (!currentUser.getId().equals(chatRoom.getCreatedBy()) &&
            !currentUser.getRole().name().equals("TENANT_ADMIN") &&
            !currentUser.getRole().name().equals("SUPER_ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        chatService.deactivateChatRoom(chatRoomId);
        return ResponseEntity.noContent().build();
    }

    private ChatRoomDto convertToDto(ChatRoom chatRoom) {
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
                    UserSummaryDTO userDto = new UserSummaryDTO();
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

    private UserSummaryDTO toUserSummary(User user) {
        UserSummaryDTO dto = new UserSummaryDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        return dto;
    }
}
