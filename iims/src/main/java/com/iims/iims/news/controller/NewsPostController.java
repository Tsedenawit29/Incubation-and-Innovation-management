package com.iims.iims.news.controller;

import com.iims.iims.news.dto.NewsPostResponseDTO;
import com.iims.iims.news.entity.NewsCategory;
import com.iims.iims.news.service.NewsPostService;
import com.iims.iims.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/news")
@RequiredArgsConstructor
public class NewsPostController {

    private final NewsPostService newsPostService;

    @PostMapping
    public ResponseEntity<NewsPostResponseDTO> createNewsPost(
            @AuthenticationPrincipal User user,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("category") NewsCategory category,
            @RequestParam("authorName") String authorName, // New: accept authorName instead of authorId
            @RequestParam(value = "linkUrl", required = false) String linkUrl,
            @RequestParam("imageFile") MultipartFile imageFile,
            @RequestParam(value = "referenceFile", required = false) MultipartFile referenceFile) throws IOException {

        NewsPostResponseDTO newPost = newsPostService.createNewsPost(user.getId(), title, content, category, authorName, linkUrl, imageFile, referenceFile);
        return new ResponseEntity<>(newPost, HttpStatus.CREATED);
    }

    // Existing methods for fetching news posts remain unchanged
    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<NewsPostResponseDTO>> getNewsPostsByTenant(@PathVariable UUID tenantId) {
        try {
            System.out.println("getNewsPostsByTenant - Tenant ID: " + tenantId);
            
            if (tenantId == null) {
                throw new RuntimeException("Tenant ID cannot be null");
            }
            
            List<NewsPostResponseDTO> posts = newsPostService.getAllNewsPostsByTenant(tenantId);
            System.out.println("getNewsPostsByTenant - Found posts: " + posts.size());
            
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            System.err.println("Error in getNewsPostsByTenant: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch news posts: " + e.getMessage(), e);
        }
    }

    @GetMapping("/tenant/{tenantId}/category/{category}")
    public ResponseEntity<List<NewsPostResponseDTO>> getNewsPostsByTenantAndCategory(
            @PathVariable UUID tenantId,
            @PathVariable NewsCategory category) {
        List<NewsPostResponseDTO> posts = newsPostService.getNewsPostsByTenantAndCategory(tenantId, category);
        return ResponseEntity.ok(posts);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<NewsPostResponseDTO> updateNewsPost(
            @PathVariable UUID postId,
            @AuthenticationPrincipal User user,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("category") NewsCategory category,
            @RequestParam("authorName") String authorName, // New: accept authorName for updates
            @RequestParam(value = "linkUrl", required = false) String linkUrl,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "referenceFile", required = false) MultipartFile referenceFile) throws IOException {

        NewsPostResponseDTO updatedPost = newsPostService.updateNewsPost(
                postId, user.getId(), title, content, category, authorName, linkUrl, imageFile, referenceFile);
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deleteNewsPost(
            @PathVariable UUID postId,
            @AuthenticationPrincipal User user) {
        newsPostService.deleteNewsPost(postId, user.getId());
        return ResponseEntity.noContent().build();
    }
}