package com.iims.iims.chat.repo;

import com.iims.iims.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {

    // Spring Data JPA automatically generates a query for this method.
    // It will find a ChatRoom by its ID.
    Optional<ChatRoom> findById(UUID id);

}