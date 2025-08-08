package com.iims.iims.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get the upload directory path (same as used in LandingPageController)
        String uploadDir = System.getProperty("landingpage.upload.dir", "uploads");
        String absoluteUploadPath;
        
        // Handle both relative and absolute paths
        if (uploadDir.startsWith("/")) {
            // Absolute path
            absoluteUploadPath = "file:" + uploadDir + "/";
        } else {
            // Relative path - make it relative to working directory
            absoluteUploadPath = "file:" + System.getProperty("user.dir") + "/" + uploadDir + "/";
        }
        
        System.out.println("=== STATIC FILE SERVING CONFIGURATION ===");
        System.out.println("Upload directory: " + uploadDir);
        System.out.println("Working directory: " + System.getProperty("user.dir"));
        System.out.println("Absolute upload path: " + absoluteUploadPath);
        System.out.println("URL pattern: /uploads/**");
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(absoluteUploadPath)
                .setCachePeriod(3600) // Cache for 1 hour
                .resourceChain(true);
                
        System.out.println("Static file serving configured successfully");
    }
} 