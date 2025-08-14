package com.iims.iims.news.entity;

import com.iims.iims.tenant.entity.Tenant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "news_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsPost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    // Change: Replaced the User author relationship with a simple String for the author's name
    @Column(name = "author_name", nullable = false, length = 255)
    private String authorName;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private NewsCategory category;

    @Column(name = "published_at", nullable = false)
    private LocalDateTime publishedAt;

    @Column(nullable = false)
    private String imageFileName; // Required field for the image file name
    
    private String referenceFileName; // Optional field for the reference file name
    private String linkUrl;         // Optional field for an external link

    @PrePersist
    protected void onCreate() {
        publishedAt = LocalDateTime.now();
    }
}