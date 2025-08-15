package com.iims.iims.news.dto;

import com.iims.iims.news.entity.NewsCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsPostResponseDTO {

    private UUID id;
    private UUID tenantId;
    private UUID authorId;
    private String authorName;
    private String title;
    private String content;
    private NewsCategory category;
    private LocalDateTime publishedAt;
    private String imageUrl;          // The URL/name of the required image file
    private String referenceFileUrl;  // The URL/name of the optional reference file
    private String linkUrl;           // The optional link URL
}