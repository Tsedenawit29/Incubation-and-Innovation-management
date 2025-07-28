package com.iims.iims.tenant.entity;

import com.iims.iims.tenant.entity.Tenant;
import com.iims.iims.tenant.entity.LandingPageSection;
import jakarta.persistence.*;
import java.util.List;
import java.util.Map;

@Entity
public class LandingPage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", unique = true)
    private Tenant tenant;

    private String themeColor;

    @OneToMany(mappedBy = "landingPage", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sectionOrder ASC")
    private List<LandingPageSection> sections;

    @ElementCollection
    @CollectionTable(name = "landing_page_social_links", joinColumns = @JoinColumn(name = "landing_page_id"))
    @MapKeyColumn(name = "platform")
    @Column(name = "url")
    private Map<String, String> socialLinks;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Tenant getTenant() { return tenant; }
    public void setTenant(Tenant tenant) { this.tenant = tenant; }
    public String getThemeColor() { return themeColor; }
    public void setThemeColor(String themeColor) { this.themeColor = themeColor; }
    public List<LandingPageSection> getSections() { return sections; }
    public void setSections(List<LandingPageSection> sections) { this.sections = sections; }
    public Map<String, String> getSocialLinks() { return socialLinks; }
    public void setSocialLinks(Map<String, String> socialLinks) { this.socialLinks = socialLinks; }
} 