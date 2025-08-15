package com.iims.iims.profile.repository;

import com.iims.iims.profile.entity.InvestorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface InvestorProfileRepository extends JpaRepository<InvestorProfile, UUID> {
    Optional<InvestorProfile> findByUserId(UUID userId);
    List<InvestorProfile> findByInvestmentFocusContainingIgnoreCase(String investmentFocus);
    List<InvestorProfile> findByCurrentCompanyContainingIgnoreCase(String company);
    List<InvestorProfile> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);
    List<InvestorProfile> findByInvestmentStageContainingIgnoreCase(String investmentStage);
    List<InvestorProfile> findByFirmNameContainingIgnoreCase(String firmName);
    long count();
}
