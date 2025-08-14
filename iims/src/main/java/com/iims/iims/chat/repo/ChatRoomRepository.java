package com.iims.iims.chat.repo;

import com.iims.iims.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {

    // Find chat rooms by tenant ID
    List<ChatRoom> findByTenantId(UUID tenantId);
    
    // Find chat rooms by user ID (user is a participant)
    @Query("SELECT cr FROM ChatRoom cr JOIN cr.users u WHERE u.id = :userId")
    List<ChatRoom> findByUserId(@Param("userId") UUID userId);
    
    // Find chat rooms by tenant ID and user ID
    @Query("SELECT cr FROM ChatRoom cr JOIN cr.users u WHERE cr.tenantId = :tenantId AND u.id = :userId")
    List<ChatRoom> findByTenantIdAndUserId(@Param("tenantId") UUID tenantId, @Param("userId") UUID userId);
    
    // Find individual chat room between two specific users
    @Query("SELECT cr FROM ChatRoom cr JOIN cr.users u1 JOIN cr.users u2 " +
           "WHERE cr.chatType = 'INDIVIDUAL' AND u1.id = :user1Id AND u2.id = :user2Id " +
           "AND cr.tenantId = :tenantId")
    Optional<ChatRoom> findIndividualChatRoom(@Param("user1Id") UUID user1Id, 
                                            @Param("user2Id") UUID user2Id, 
                                            @Param("tenantId") UUID tenantId);
    
    // Find chat rooms by type and tenant
    List<ChatRoom> findByChatTypeAndTenantId(ChatRoom.ChatType chatType, UUID tenantId);
    
    // Find active chat rooms
    List<ChatRoom> findByIsActiveTrue();
    
    // Find chat rooms by creator
    List<ChatRoom> findByCreatedBy(UUID createdBy);
}