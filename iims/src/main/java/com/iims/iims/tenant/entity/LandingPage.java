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
    private String themeColor2;
    private String themeColor3;

    @OneToMany(mappedBy = "landingPage", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sectionOrder ASC")
    private List<LandingPageSection> sections;

    @ElementCollection
    @CollectionTable(name = "landing_page_social_links", joinColumns = @JoinColumn(name = "landing_page_id"))
    @MapKeyColumn(name = "platform")
    @Column(name = "url")
    private Map<String, String> socialLinks;

    @ElementCollection
    @CollectionTable(name = "landing_page_button_urls", joinColumns = @JoinColumn(name = "landing_page_id"))
    @MapKeyColumn(name = "button_type")
    @Column(name = "url")
    private Map<String, String> buttonUrls;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Tenant getTenant() { return tenant; }
    public void setTenant(Tenant tenant) { this.tenant = tenant; }
    public String getThemeColor() { return themeColor; }
    public void setThemeColor(String themeColor) { this.themeColor = themeColor; }
    public String getThemeColor2() { return themeColor2; }
    public void setThemeColor2(String themeColor2) { this.themeColor2 = themeColor2; }
    public String getThemeColor3() { return themeColor3; }
    public void setThemeColor3(String themeColor3) { this.themeColor3 = themeColor3; }
    public List<LandingPageSection> getSections() { return sections; }
    public void setSections(List<LandingPageSection> sections) { this.sections = sections; }
    public Map<String, String> getSocialLinks() { return socialLinks; }
    public void setSocialLinks(Map<String, String> socialLinks) { this.socialLinks = socialLinks; }
    public Map<String, String> getButtonUrls() { return buttonUrls; }
    public void setButtonUrls(Map<String, String> buttonUrls) { this.buttonUrls = buttonUrls; }
} 