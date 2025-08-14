package com.iims.iims.tenant.service;

import com.iims.iims.tenant.dto.LandingPageDto;
import com.iims.iims.tenant.dto.LandingPageSectionDto;
import com.iims.iims.tenant.entity.LandingPage;
import com.iims.iims.tenant.entity.LandingPageSection;
import com.iims.iims.tenant.entity.Tenant;
import com.iims.iims.tenant.repository.LandingPageRepository;
import com.iims.iims.tenant.repository.LandingPageSectionRepository;
import com.iims.iims.tenant.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.UUID;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Transactional
@Service
public class LandingPageService {
    private static final Logger logger = LoggerFactory.getLogger(LandingPageService.class);
    @Autowired
    private LandingPageRepository landingPageRepository;
    @Autowired
    private LandingPageSectionRepository sectionRepository;
    @Autowired
    private TenantRepository tenantRepository;

    public LandingPageDto getLandingPageByTenantId(UUID tenantId) {
        try {
            logger.info("Getting landing page for tenant: {}", tenantId);
            Optional<LandingPage> landingPageOpt = landingPageRepository.findByTenantId(tenantId);
            LandingPageDto result = landingPageOpt.map(this::toDto).orElse(null);
            logger.info("Landing page found: {}", result != null);
            return result;
        } catch (Exception e) {
            logger.error("Error getting landing page for tenant {}: {}", tenantId, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public LandingPageDto createOrUpdateLandingPage(UUID tenantId, LandingPageDto dto) {
        try {
            logger.info("Creating/updating landing page for tenant: {}", tenantId);
            logger.debug("DTO sections count: {}", dto.getSections() != null ? dto.getSections().size() : 0);
            
            Tenant tenant = tenantRepository.findById(tenantId).orElseThrow(() -> {
                logger.error("Tenant not found: {}", tenantId);
                return new RuntimeException("Tenant not found: " + tenantId);
            });
            logger.info("Found tenant: {}", tenant.getId());
            
            LandingPage landingPage = landingPageRepository.findByTenant(tenant).orElse(new LandingPage());
            logger.info("Existing landing page found: {}", landingPage.getId() != null);
            
            landingPage.setTenant(tenant);
            landingPage.setThemeColor(dto.getThemeColor());
            landingPage.setThemeColor2(dto.getThemeColor2());
            landingPage.setThemeColor3(dto.getThemeColor3());
            landingPage.setSocialLinks(dto.getSocialLinks());
            landingPage.setButtonUrls(dto.getButtonUrls());
            
            // Update sections in-place for orphanRemoval
            if (landingPage.getSections() != null) {
                landingPage.getSections().clear();
            } else {
                landingPage.setSections(new java.util.ArrayList<>());
            }
            
            if (dto.getSections() != null) {
                List<LandingPageSection> sections = dto.getSections().stream().map(s -> {
                    LandingPageSection section = new LandingPageSection();
                    section.setLandingPage(landingPage);
                    section.setType(s.getType());
                    section.setContentJson(s.getContentJson());
                    section.setSectionOrder(s.getSectionOrder());
                    return section;
                }).collect(Collectors.toList());
                landingPage.getSections().addAll(sections);
                logger.info("Added {} sections", sections.size());
            }
            
            LandingPage saved = landingPageRepository.save(landingPage);
            logger.info("Successfully saved landing page with ID: {}", saved.getId());
            return toDto(saved);
        } catch (Exception e) {
            logger.error("Error creating/updating landing page for tenant {}: {}", tenantId, e.getMessage(), e);
            throw e;
        }
    }

    public void deleteLandingPage(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId).orElseThrow();
        landingPageRepository.findByTenant(tenant).ifPresent(landingPageRepository::delete);
    }

    private LandingPageDto toDto(LandingPage entity) {
        LandingPageDto dto = new LandingPageDto();
        dto.setId(entity.getId());
        dto.setTenantId(entity.getTenant() != null ? entity.getTenant().getId() : null);
        dto.setThemeColor(entity.getThemeColor());
        dto.setThemeColor2(entity.getThemeColor2());
        dto.setThemeColor3(entity.getThemeColor3());
        dto.setSocialLinks(entity.getSocialLinks());
        dto.setButtonUrls(entity.getButtonUrls());
        if (entity.getSections() != null) {
            dto.setSections(entity.getSections().stream().map(this::toSectionDto).collect(Collectors.toList()));
        }
        return dto;
    }

    private LandingPageSectionDto toSectionDto(LandingPageSection section) {
        LandingPageSectionDto dto = new LandingPageSectionDto();
        dto.setId(section.getId());
        dto.setType(section.getType());
        dto.setContentJson(section.getContentJson());
        dto.setSectionOrder(section.getSectionOrder());
        return dto;
    }

    public String uploadImage(UUID tenantId, MultipartFile file) throws IOException {
        try {
            logger.info("Uploading image for tenant: {}, filename: {}", tenantId, file.getOriginalFilename());
            
            // Create uploads directory if it doesn't exist
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
                logger.info("Created uploads directory: {}", uploadDir.toAbsolutePath());
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = tenantId + "_" + System.currentTimeMillis() + fileExtension;
            
            // Save file
            Path filePath = uploadDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return the URL path
            String imageUrl = "/uploads/" + uniqueFilename;
            logger.info("Image uploaded successfully: {}", imageUrl);
            return imageUrl;
            
        } catch (IOException e) {
            logger.error("Error uploading image for tenant {}: {}", tenantId, e.getMessage(), e);
            throw e;
        }
    }
} 