package com.iims.iims.tenant.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public class LandingPageDto {
    private Long id;
    private UUID tenantId;
    private String themeColor;
    private String themeColor2;
    private String themeColor3;
    private List<LandingPageSectionDto> sections;
    private Map<String, String> socialLinks;
    private Map<String, String> buttonUrls;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    
    public String getThemeColor() { return themeColor; }
    public void setThemeColor(String themeColor) { this.themeColor = themeColor; }
    
    public String getThemeColor2() { return themeColor2; }
    public void setThemeColor2(String themeColor2) { this.themeColor2 = themeColor2; }
    
    public String getThemeColor3() { return themeColor3; }
    public void setThemeColor3(String themeColor3) { this.themeColor3 = themeColor3; }
    
    public List<LandingPageSectionDto> getSections() { return sections; }
    public void setSections(List<LandingPageSectionDto> sections) { this.sections = sections; }
    
    public Map<String, String> getSocialLinks() { return socialLinks; }
    public void setSocialLinks(Map<String, String> socialLinks) { this.socialLinks = socialLinks; }
    
    public Map<String, String> getButtonUrls() { return buttonUrls; }
    public void setButtonUrls(Map<String, String> buttonUrls) { this.buttonUrls = buttonUrls; }
} 