package com.iims.iims.application_from.repository;

import com.iims.iims.application_from.entity.ApplicationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationDocumentRepository extends JpaRepository<ApplicationDocument, UUID> {

    List<ApplicationDocument> findByApplicationId(UUID applicationId);
    
    List<ApplicationDocument> findByApplicationIdAndIsActiveTrue(UUID applicationId);
    
    List<ApplicationDocument> findByApplicationIdAndDocumentType(UUID applicationId, String documentType);
}
