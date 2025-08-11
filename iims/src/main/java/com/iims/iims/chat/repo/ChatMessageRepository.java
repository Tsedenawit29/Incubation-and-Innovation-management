package com.iims.iims.chat.repo;

import com.iims.iims.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    // Spring Data JPA automatically generates a query to find all messages
    // belonging to a specific chat room, ordered by timestamp.
    List<ChatMessage> findByChatRoomIdOrderByTimestampAsc(UUID chatRoomId);

}