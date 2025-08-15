package com.iims.iims.profile.service;

import com.iims.iims.profile.dto.InvestorProfileDto;
import com.iims.iims.profile.dto.InvestorProfileUpdateRequest;
import com.iims.iims.profile.entity.InvestorProfile;
import com.iims.iims.profile.repository.InvestorProfileRepository;
import com.iims.iims.profile.exception.ProfileNotFoundException;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InvestorProfileService {
    private final InvestorProfileRepository investorProfileRepository;
    private final UserRepository userRepository;

    public InvestorProfileService(InvestorProfileRepository investorProfileRepository, UserRepository userRepository) {
        this.investorProfileRepository = investorProfileRepository;
        this.userRepository = userRepository;
    }

    public InvestorProfileDto getProfileByUserId(UUID userId) {
        InvestorProfile profile = investorProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Create a basic profile if it doesn't exist
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ProfileNotFoundException("User not found with ID: " + userId));
                    
                    return InvestorProfile.builder()
                            .user(user)
                            .firstName(user.getFullName() != null ? user.getFullName().split(" ")[0] : "")
                            .lastName(user.getFullName() != null && user.getFullName().split(" ").length > 1 ? 
                                     user.getFullName().split(" ")[1] : "")
                            .isActive(true)
                            .build();
                });
        return convertToDto(profile);
    }

    @Transactional
    public InvestorProfileDto createProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ProfileNotFoundException("User not found with ID: " + userId));

        if (investorProfileRepository.findByUserId(userId).isPresent()) {
            throw new IllegalStateException("Investor profile already exists for user ID: " + userId);
        }

        InvestorProfile profile = InvestorProfile.builder()
                .user(user)
                .firstName(user.getFullName() != null ? user.getFullName().split(" ")[0] : "")
                .lastName(user.getFullName() != null && user.getFullName().split(" ").length > 1 ? 
                         user.getFullName().split(" ")[1] : "")
                .build();

        InvestorProfile savedProfile = investorProfileRepository.save(profile);
        return convertToDto(savedProfile);
    }

    @Transactional
    public InvestorProfileDto updateProfile(UUID userId, InvestorProfileUpdateRequest request) {
        // Try to find existing profile, if not found, create a new one
        InvestorProfile profile = investorProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Create new profile if it doesn't exist
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ProfileNotFoundException("User not found with ID: " + userId));
                    
                    return InvestorProfile.builder()
                            .user(user)
                            .firstName(user.getFullName() != null ? user.getFullName().split(" ")[0] : "")
                            .lastName(user.getFullName() != null && user.getFullName().split(" ").length > 1 ? 
                                     user.getFullName().split(" ")[1] : "")
                            .build();
                });

        updateProfileFromRequest(profile, request);
        InvestorProfile savedProfile = investorProfileRepository.save(profile);
        return convertToDto(savedProfile);
    }

    public List<InvestorProfileDto> getAllInvestors() {
        return investorProfileRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<InvestorProfileDto> searchInvestors(String query) {
        return investorProfileRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query, query)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<InvestorProfileDto> getInvestorsByFocus(String investmentFocus) {
        return investorProfileRepository.findByInvestmentFocusContainingIgnoreCase(investmentFocus)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<InvestorProfileDto> getInvestorsByStage(String investmentStage) {
        return investorProfileRepository.findByInvestmentStageContainingIgnoreCase(investmentStage)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public long getInvestorCount() {
        return investorProfileRepository.count();
    }

    @Transactional
    public void deleteProfile(UUID userId) {
        InvestorProfile profile = investorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Investor profile not found for user ID: " + userId));
        investorProfileRepository.delete(profile);
    }

    private InvestorProfileDto convertToDto(InvestorProfile profile) {
        return InvestorProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .bio(profile.getBio())
                .currentPosition(profile.getCurrentPosition())
                .currentCompany(profile.getCurrentCompany())
                .investmentFocus(profile.getInvestmentFocus())
                .investmentPhilosophy(profile.getInvestmentPhilosophy())
                .linkedin(profile.getLinkedin())
                .twitter(profile.getTwitter())
                .avatarUrl(profile.getAvatarUrl())
                .country(profile.getCountry())
                .city(profile.getCity())
                .phone(profile.getPhone())
                .address(profile.getAddress())
                .website(profile.getWebsite())
                .yearsOfExperience(profile.getYearsOfExperience())
                .firmName(profile.getFirmName())
                .investmentCriteria(profile.getInvestmentCriteria())
                .portfolioCompanies(profile.getPortfolioCompanies())
                .mentorshipAreas(profile.getMentorshipAreas())
                .ticketSize(profile.getTicketSize())
                .investmentStage(profile.getInvestmentStage())
                .isActive(profile.getIsActive())
                .isPublic(profile.getIsPublic())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private void updateProfileFromRequest(InvestorProfile profile, InvestorProfileUpdateRequest request) {
        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName());
        if (request.getLastName() != null) profile.setLastName(request.getLastName());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getCurrentPosition() != null) profile.setCurrentPosition(request.getCurrentPosition());
        if (request.getCurrentCompany() != null) profile.setCurrentCompany(request.getCurrentCompany());
        if (request.getInvestmentFocus() != null) profile.setInvestmentFocus(request.getInvestmentFocus());
        if (request.getInvestmentPhilosophy() != null) profile.setInvestmentPhilosophy(request.getInvestmentPhilosophy());
        if (request.getLinkedin() != null) profile.setLinkedin(request.getLinkedin());
        if (request.getTwitter() != null) profile.setTwitter(request.getTwitter());
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(request.getAvatarUrl());
        if (request.getCountry() != null) profile.setCountry(request.getCountry());
        if (request.getCity() != null) profile.setCity(request.getCity());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getWebsite() != null) profile.setWebsite(request.getWebsite());
        if (request.getYearsOfExperience() != null) profile.setYearsOfExperience(request.getYearsOfExperience());
        if (request.getFirmName() != null) profile.setFirmName(request.getFirmName());
        if (request.getInvestmentCriteria() != null) profile.setInvestmentCriteria(request.getInvestmentCriteria());
        if (request.getPortfolioCompanies() != null) profile.setPortfolioCompanies(request.getPortfolioCompanies());
        if (request.getMentorshipAreas() != null) profile.setMentorshipAreas(request.getMentorshipAreas());
        if (request.getTicketSize() != null) profile.setTicketSize(request.getTicketSize());
        if (request.getInvestmentStage() != null) profile.setInvestmentStage(request.getInvestmentStage());
    }
}
