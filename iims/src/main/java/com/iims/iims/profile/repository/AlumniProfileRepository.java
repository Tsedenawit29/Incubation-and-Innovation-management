package com.iims.iims.profile.repository;

import com.iims.iims.profile.entity.AlumniProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface AlumniProfileRepository extends JpaRepository<AlumniProfile, UUID> {
    Optional<AlumniProfile> findByUserId(UUID userId);
    List<AlumniProfile> findByIndustryContainingIgnoreCase(String industry);
    List<AlumniProfile> findByCurrentCompanyContainingIgnoreCase(String company);
    List<AlumniProfile> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);
    long count();
}
