package com.iims.iims.profile.repository;

import com.iims.iims.profile.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

// This interface provides CRUD operations for the Document entity.
// Spring Data JPA will automatically implement these methods.
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    // You can add custom query methods here if needed, e.g., findByStartupProfileId
}
