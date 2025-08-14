package com.iims.iims.news.service;

import com.iims.iims.news.dto.NewsPostResponseDTO;
import com.iims.iims.news.entity.NewsCategory;
import com.iims.iims.news.entity.NewsPost;
import com.iims.iims.news.repository.NewsPostRepository;
import com.iims.iims.tenant.entity.Tenant;
import com.iims.iims.tenant.repository.TenantRepository;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NewsPostService {

    private final NewsPostRepository newsPostRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final FileStorageService fileStorageService;

    public NewsPostResponseDTO createNewsPost(
            UUID tenantAdminId, String title, String content, NewsCategory category,
            String authorName, String linkUrl, MultipartFile imageFile, MultipartFile referenceFile) throws IOException {

        User tenantAdmin = userRepository.findById(tenantAdminId)
                .orElseThrow(() -> new EntityNotFoundException("Admin not found with ID: " + tenantAdminId));

        if (tenantAdmin.getRole() != com.iims.iims.user.entity.Role.TENANT_ADMIN) {
            throw new IllegalArgumentException("Only a TENANT_ADMIN can create news posts.");
        }
        
        if (imageFile == null || imageFile.isEmpty()) {
            throw new IllegalArgumentException("Image file is required.");
        }

        Tenant tenant = tenantRepository.findById(tenantAdmin.getTenantId())
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found for admin's tenantId."));

        String imageFileName = fileStorageService.uploadFile(imageFile);

        String referenceFileName = null;
        if (referenceFile != null && !referenceFile.isEmpty()) {
            referenceFileName = fileStorageService.uploadFile(referenceFile);
        }

        NewsPost newPost = NewsPost.builder()
                .tenant(tenant)
                .authorName(authorName) // Use the authorName from the request
                .title(title)
                .content(content)
                .category(category)
                .imageFileName(imageFileName)
                .referenceFileName(referenceFileName)
                .linkUrl(linkUrl)
                .build();

        NewsPost savedPost = newsPostRepository.save(newPost);
        return mapToResponseDTO(savedPost);
    }

    public List<NewsPostResponseDTO> getAllNewsPostsByTenant(UUID tenantId) {
        List<NewsPost> posts = newsPostRepository.findByTenantIdOrderByPublishedAtDesc(tenantId);
        return posts.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    public List<NewsPostResponseDTO> getNewsPostsByTenantAndCategory(UUID tenantId, NewsCategory category) {
        List<NewsPost> posts = newsPostRepository.findByTenantIdAndCategoryOrderByPublishedAtDesc(tenantId, category);
        return posts.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    public NewsPostResponseDTO updateNewsPost(
            UUID postId, UUID requesterId, String title, String content, NewsCategory category,
            String authorName, String linkUrl, MultipartFile imageFile, MultipartFile referenceFile) throws IOException {

        // Verify requester is TENANT_ADMIN
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new EntityNotFoundException("Requester not found with ID: " + requesterId));

        if (requester.getRole() != com.iims.iims.user.entity.Role.TENANT_ADMIN) {
            throw new IllegalArgumentException("Only a TENANT_ADMIN can update news posts.");
        }

        // Find the existing post
        NewsPost existingPost = newsPostRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("News post not found with ID: " + postId));

        // Verify the post belongs to the same tenant
        if (!existingPost.getTenant().getId().equals(requester.getTenantId())) {
            throw new IllegalArgumentException("Cannot update news post from different tenant.");
        }

        // Handle image file update
        String imageFileName = existingPost.getImageFileName();
        if (imageFile != null && !imageFile.isEmpty()) {
            // Delete old file if a new one is uploaded
            fileStorageService.deleteFile(existingPost.getImageFileName());
            imageFileName = fileStorageService.uploadFile(imageFile);
        }

        // Handle reference file update
        String referenceFileName = existingPost.getReferenceFileName();
        if (referenceFile != null && !referenceFile.isEmpty()) {
            // Delete old file if a new one is uploaded
            if (existingPost.getReferenceFileName() != null) {
                fileStorageService.deleteFile(existingPost.getReferenceFileName());
            }
            referenceFileName = fileStorageService.uploadFile(referenceFile);
        }

        // Update the post with the new author name
        existingPost.setTitle(title);
        existingPost.setContent(content);
        existingPost.setCategory(category);
        existingPost.setLinkUrl(linkUrl);
        existingPost.setAuthorName(authorName);
        existingPost.setImageFileName(imageFileName);
        existingPost.setReferenceFileName(referenceFileName);

        NewsPost updatedPost = newsPostRepository.save(existingPost);
        return mapToResponseDTO(updatedPost);
    }

    public void deleteNewsPost(UUID postId, UUID requesterId) {
        // Verify requester is TENANT_ADMIN
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new EntityNotFoundException("Requester not found with ID: " + requesterId));

        if (requester.getRole() != com.iims.iims.user.entity.Role.TENANT_ADMIN) {
            throw new IllegalArgumentException("Only a TENANT_ADMIN can delete news posts.");
        }

        // Find the existing post
        NewsPost existingPost = newsPostRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("News post not found with ID: " + postId));

        // Verify the post belongs to the same tenant
        if (!existingPost.getTenant().getId().equals(requester.getTenantId())) {
            throw new IllegalArgumentException("Cannot delete news post from different tenant.");
        }

        // Delete associated files before deleting the entity
        fileStorageService.deleteFile(existingPost.getImageFileName());
        if (existingPost.getReferenceFileName() != null) {
            fileStorageService.deleteFile(existingPost.getReferenceFileName());
        }

        newsPostRepository.delete(existingPost);
    }

    private NewsPostResponseDTO mapToResponseDTO(NewsPost post) {
        // Build full URLs for files to ensure proper image loading
        String imageUrl = null;
        if (post.getImageFileName() != null && !post.getImageFileName().isEmpty()) {
            imageUrl = "http://localhost:8081/uploads/" + post.getImageFileName();
        }
        
        String referenceFileUrl = null;
        if (post.getReferenceFileName() != null && !post.getReferenceFileName().isEmpty()) {
            referenceFileUrl = "http://localhost:8081/uploads/" + post.getReferenceFileName();
        }
        
        return NewsPostResponseDTO.builder()
                .id(post.getId())
                .tenantId(post.getTenant().getId())
                // Pass the authorName directly to the DTO
                .authorName(post.getAuthorName())
                .title(post.getTitle())
                .content(post.getContent())
                .category(post.getCategory())
                .publishedAt(post.getPublishedAt())
                .imageUrl(imageUrl)
                .referenceFileUrl(referenceFileUrl)
                .linkUrl(post.getLinkUrl())
                .build();
    }
}