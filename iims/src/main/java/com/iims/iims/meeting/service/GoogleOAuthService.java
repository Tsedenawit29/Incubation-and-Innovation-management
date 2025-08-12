package com.iims.iims.meeting.service;

import com.iims.iims.meeting.config.GoogleOAuthConfig;
import com.iims.iims.meeting.entity.GoogleOAuthToken;
import com.iims.iims.meeting.repository.GoogleOAuthTokenRepository;
import com.iims.iims.tenant.entity.Tenant;
import com.iims.iims.tenant.repository.TenantRepository;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
// import com.iims.iims.meeting.util.TokenEncryptor; // Temporarily disabled
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private final GoogleOAuthConfig config;
    private final GoogleOAuthTokenRepository tokenRepo;
    private final UserRepository userRepo;
    private final TenantRepository tenantRepo;
    // private final TokenEncryptor encryptor; // Temporarily disabled
    private final RestTemplate restTemplate;
    
    /**
     * Build the Google OAuth2 authorization URL
     * type = "user" or "tenant"
     * id = UUID of user or tenant
     */
    public String buildAuthorizationUrl(String type, UUID id, String stateNonce) {
        String state = type + ":" + id + ":" + stateNonce;
        
        return UriComponentsBuilder.fromHttpUrl("https://accounts.google.com/o/oauth2/v2/auth")
                .queryParam("client_id", config.getClientId())
                .queryParam("redirect_uri", config.getRedirectUri())
                .queryParam("response_type", "code")
                .queryParam("scope", String.join(" ", config.getScopes()))
                .queryParam("access_type", "offline")  // request refresh token
                .queryParam("prompt", "consent")
                .queryParam("state", state)
                .build().toUriString();
    }

    /**
     * Exchange authorization code for tokens and store them
     */
    @Transactional
    public void handleCallback(String code, String state) {
        // Log the callback attempt
        log.info("Processing OAuth callback with code length: {}, state: {}", 
                 code != null ? code.length() : "null", state);

        // 1. Validate inputs
        if (code == null || code.trim().isEmpty()) {
            log.error("Authorization code is missing.");
            throw new IllegalArgumentException("Authorization code is required");
        }
        
        if (state == null || state.trim().isEmpty()) {
            log.error("State parameter is missing.");
            throw new IllegalArgumentException("State parameter is required");
        }
        
        // 2. Parse state (type:id:nonce)
        String[] parts = state.split(":");
        if (parts.length < 2) {
            log.error("Invalid state format. Expected: type:id:nonce, got: {}", state);
            throw new IllegalArgumentException("Invalid state parameter format");
        }
        
        String type = parts[0];
        UUID id;
        try {
            id = UUID.fromString(parts[1]);
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID in state parameter: {}", parts[1]);
            throw new IllegalArgumentException("Invalid UUID in state parameter: " + parts[1]);
        }

        // 3. Exchange code for tokens
        Map<String, Object> tokenResponse = exchangeCodeForTokens(code);

        String accessToken = (String) tokenResponse.get("access_token");
        String refreshToken = (String) tokenResponse.get("refresh_token");
        Number expiresIn = (Number) tokenResponse.getOrDefault("expires_in", 3600);
        String scope = (String) tokenResponse.get("scope");
        String tokenType = (String) tokenResponse.get("token_type");

        if (accessToken == null) {
            log.error("Access token not received from Google.");
            throw new RuntimeException("No access token received from Google");
        }

        // 4. Build and save the token
        GoogleOAuthToken token = GoogleOAuthToken.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .expiryTime(Instant.now().plusSeconds(expiresIn.longValue()))
            .scope(scope)
            .tokenType(tokenType)
            .build();

        if ("user".equals(type)) {
            User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
            
            // Check for existing token and reuse the ID for an update
            tokenRepo.findByUserId(user.getId())
                .ifPresent(existing -> token.setId(existing.getId()));

            token.setUserId(user.getId());
            tokenRepo.save(token);
            log.info("Successfully saved OAuth token for user: {}", user.getEmail());
            
        } else if ("tenant".equals(type)) {
            Tenant tenant = tenantRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found with ID: " + id));
            
            // Check for existing token and reuse the ID for an update
            tokenRepo.findByTenantId(tenant.getId())
                .ifPresent(existing -> token.setId(existing.getId()));

            token.setTenantId(tenant.getId());
            tokenRepo.save(token);
            log.info("Successfully saved OAuth token for tenant: {}", tenant.getName());
            
        } else {
            log.error("Unknown type: {}. Expected 'user' or 'tenant'", type);
            throw new IllegalArgumentException("Unknown type: " + type);
        }
    }

    /**
     * Exchange authorization code for tokens using Google's token endpoint
     */
    private Map<String, Object> exchangeCodeForTokens(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", config.getClientId());
        body.add("client_secret", config.getClientSecret());
        body.add("redirect_uri", config.getRedirectUri());
        body.add("grant_type", "authorization_code");

        log.debug("Exchanging code for tokens with client_id: {}", config.getClientId());
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://oauth2.googleapis.com/token",
                new HttpEntity<>(body, headers),
                Map.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("Token exchange failed with status: {} and body: {}", response.getStatusCode(), response.getBody());
                throw new RuntimeException("Token exchange failed: " + response.getBody());
            }
            
            log.info("Token exchange successful!");
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to exchange authorization code for tokens: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to exchange authorization code: " + e.getMessage(), e);
        }
    }

    /**
     * Refresh an access token using refresh_token
     */
    @Transactional
    public Map<String, Object> refreshAccessToken(GoogleOAuthToken token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", config.getClientId());
        body.add("client_secret", config.getClientSecret());
        body.add("grant_type", "refresh_token");
        body.add("refresh_token", token.getRefreshToken());

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://oauth2.googleapis.com/token",
                new HttpEntity<>(body, headers),
                Map.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("Token refresh failed with status: {}", response.getStatusCode());
                throw new RuntimeException("Token refresh failed: " + response.getBody());
            }

            Map<String, Object> responseBody = response.getBody();
            
            // update stored token
            String newAccessToken = (String) responseBody.get("access_token");
            Number expiresIn = (Number) responseBody.getOrDefault("expires_in", 3600);
            token.setAccessToken(newAccessToken);
            token.setExpiryTime(Instant.now().plusSeconds(expiresIn.longValue()));
            
            // Check for a new refresh token (it's optional in Google's response)
            String newRefreshToken = (String) responseBody.get("refresh_token");
            if (newRefreshToken != null) {
                token.setRefreshToken(newRefreshToken);
            }
            
            tokenRepo.save(token);
            log.info("Access token refreshed successfully for token ID: {}", token.getId());
            return responseBody;
        } catch (Exception e) {
            log.error("Failed to refresh access token: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to refresh token: " + e.getMessage(), e);
        }
    }
}