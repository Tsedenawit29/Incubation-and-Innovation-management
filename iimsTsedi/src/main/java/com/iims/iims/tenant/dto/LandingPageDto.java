package com.iims.iims.tenant.dto;

import java.util.List;
import java.util.Map;

public class LandingPageDto {
    private Long id;
    private String themeColor;
    private List<LandingPageSectionDto> sections;
    private Map<String, String> socialLinks;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getThemeColor() { return themeColor; }
    public void setThemeColor(String themeColor) { this.themeColor = themeColor; }
    public List<LandingPageSectionDto> getSections() { return sections; }
    public void setSections(List<LandingPageSectionDto> sections) { this.sections = sections; }
    public Map<String, String> getSocialLinks() { return socialLinks; }
    public void setSocialLinks(Map<String, String> socialLinks) { this.socialLinks = socialLinks; }
} 