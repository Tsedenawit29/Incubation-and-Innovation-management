package com.iims.iims.tenant.entity;

import com.iims.iims.tenant.entity.SectionType;
import jakarta.persistence.*;

@Entity
public class LandingPageSection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landing_page_id")
    private LandingPage landingPage;

    @Enumerated(EnumType.STRING)
    private SectionType type;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String contentJson; // JSON string for structured content

    private Integer sectionOrder;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LandingPage getLandingPage() { return landingPage; }
    public void setLandingPage(LandingPage landingPage) { this.landingPage = landingPage; }
    public SectionType getType() { return type; }
    public void setType(SectionType type) { this.type = type; }
    public String getContentJson() { return contentJson; }
    public void setContentJson(String contentJson) { this.contentJson = contentJson; }
    public Integer getSectionOrder() { return sectionOrder; }
    public void setSectionOrder(Integer sectionOrder) { this.sectionOrder = sectionOrder; }
} 