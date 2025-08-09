package com.iims.iims.meeting.service;

import com.iims.iims.meeting.config.GoogleOAuthConfig;
import com.iims.iims.meeting.entity.GoogleOAuthToken;
import com.iims.iims.meeting.repository.GoogleOAuthTokenRepository;
import com.iims.iims.tenant.entity.Tenant;
import com.iims.iims.tenant.repository.TenantRepository;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import com.iims.iims.meeting.util.TokenEncryptor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private final GoogleOAuthConfig config;
    private final GoogleOAuthTokenRepository tokenRepo;
    private final UserRepository userRepo;
    private final TenantRepository tenantRepo;
    private final TokenEncryptor encryptor;
    private final RestTemplate restTemplate;
    /**
     * Build the Google OAuth2 authorization URL
     * type = "user" or "tenant"
     * id = UUID of user or tenant
     */
    public String buildAuthorizationUrl(String type, UUID id, String stateNonce) {
        String state = type + ":" + id + ":" + stateNonce; // you should HMAC this in prod
        String base = "https://accounts.google.com/o/oauth2/v2/auth";

        UriComponentsBuilder b = UriComponentsBuilder.fromHttpUrl(base)
                .queryParam("client_id", config.getClientId())
                .queryParam("redirect_uri", config.getRedirectUri())
                .queryParam("response_type", "code")
                .queryParam("scope", config.getScopes())
                .queryParam("access_type", "offline")  // request refresh token
                .queryParam("prompt", "consent")
                .queryParam("state", state);

        return b.toUriString();
    }

    /**
     * Exchange authorization code for tokens and store them
     */
    public void handleCallback(String code, String state) {
        // parse state (type:id:nonce)
        String[] parts = state.split(":");
        if (parts.length < 2) throw new IllegalArgumentException("Invalid state");
        String type = parts[0];
        UUID id = UUID.fromString(parts[1]);

        Map<String, Object> tokenResponse = exchangeCodeForTokens(code);

        String accessToken = (String) tokenResponse.get("access_token");
        String refreshToken = (String) tokenResponse.get("refresh_token");
        Integer expiresIn = (Integer) tokenResponse.getOrDefault("expires_in", 3600);
        String scope = (String) tokenResponse.get("scope");
        String tokenType = (String) tokenResponse.get("token_type");

        GoogleOAuthToken token = GoogleOAuthToken.builder()
                .accessToken(accessToken)
                .refreshToken(encryptor.encrypt(refreshToken))
                .expiryTime(Instant.now().plusSeconds(expiresIn))
                .scope(scope)
                .tokenType(tokenType)
                .build();

        if ("user".equals(type)) {
            User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
            token.setUserId(user.getId());
            tokenRepo.findByUserId(user.getId()).ifPresent(existing -> {
                token.setId(existing.getId());
            });
            tokenRepo.save(token);
        } else if ("tenant".equals(type)) {
            Tenant tenant = tenantRepo.findById(id).orElseThrow(() -> new RuntimeException("Tenant not found"));
            token.setTenantId(tenant.getId());
            tokenRepo.findByTenantId(tenant.getId()).ifPresent(existing -> {
                token.setId(existing.getId());
            });
            tokenRepo.save(token);
        } else {
            throw new IllegalArgumentException("Unknown type");
        }
    }

    /**
     * Exchange authorization code for tokens using Google's token endpoint
     */
    private Map<String, Object> exchangeCodeForTokens(String code) {
        String tokenUrl = "https://oauth2.googleapis.com/token";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(tokenUrl)
                .queryParam("code", code)
                .queryParam("client_id", config.getClientId())
                .queryParam("client_secret", config.getClientSecret())
                .queryParam("redirect_uri", config.getRedirectUri())
                .queryParam("grant_type", "authorization_code");

        HttpEntity<?> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> resp = restTemplate.exchange(
                builder.toUriString(), HttpMethod.POST, entity, Map.class);

        if (!resp.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Failed to exchange code: " + resp.getStatusCode());
        }
        // resp body includes access_token, refresh_token, expires_in, scope, token_type
        return resp.getBody();
    }

    /**
     * Refresh an access token using refresh_token
     */
    public Map<String, Object> refreshAccessToken(GoogleOAuthToken token) {
        String refreshUrl = "https://oauth2.googleapis.com/token";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = "client_id=" + config.getClientId()
                + "&client_secret=" + config.getClientSecret()
                + "&grant_type=refresh_token"
                + "&refresh_token=" + encryptor.decrypt(token.getRefreshToken());

        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> resp = restTemplate.postForEntity(refreshUrl, entity, Map.class);

        if (!resp.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Failed to refresh token: " + resp.getStatusCode());
        }
        Map<String, Object> map = resp.getBody();

        // update stored token
        String newAccessToken = (String) map.get("access_token");
        Integer expiresIn = (Integer) map.getOrDefault("expires_in", 3600);
        token.setAccessToken(newAccessToken);
        token.setExpiryTime(Instant.now().plusSeconds(expiresIn));
        tokenRepo.save(token);
        return map;
    }
}
