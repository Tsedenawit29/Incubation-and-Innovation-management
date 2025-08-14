package com.iims.iims.tenant.dto;

import com.iims.iims.tenant.entity.SectionType;

public class LandingPageSectionDto {
    private Long id;
    private SectionType type;
    private String contentJson;
    private Integer sectionOrder;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SectionType getType() { return type; }
    public void setType(SectionType type) { this.type = type; }
    public String getContentJson() { return contentJson; }
    public void setContentJson(String contentJson) { this.contentJson = contentJson; }
    public Integer getSectionOrder() { return sectionOrder; }
    public void setSectionOrder(Integer sectionOrder) { this.sectionOrder = sectionOrder; }
} 