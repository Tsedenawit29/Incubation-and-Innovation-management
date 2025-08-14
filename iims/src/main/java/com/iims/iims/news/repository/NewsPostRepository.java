package com.iims.iims.news.repository;

import com.iims.iims.news.entity.NewsCategory;
import com.iims.iims.news.entity.NewsPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface NewsPostRepository extends JpaRepository<NewsPost, UUID> {
    List<NewsPost> findByTenantIdOrderByPublishedAtDesc(UUID tenantId);
    List<NewsPost> findByTenantIdAndCategoryOrderByPublishedAtDesc(UUID tenantId, NewsCategory category);
}