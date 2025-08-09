// AuthService.java
package com.iims.iims.auth.service;

import com.iims.iims.auth.dto.AuthRequest;
import com.iims.iims.auth.dto.AuthResponse;
import com.iims.iims.auth.dto.RegisterRequest;
import com.iims.iims.user.entity.Role;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;
    private final RefreshTokenService refreshTokenService;

    public AuthResponse authenticate(AuthRequest req) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
            User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // *** THE FIX IS HERE: Call a method that handles update or creation ***
            String refreshToken = refreshTokenService.createOrUpdateRefreshToken(user).getToken();

            return new AuthResponse(
                jwtService.generateToken(user),
                refreshToken,
                user.getEmail(),
                user.getRole().name(),
                user.getFullName(),
                user.getId(),
                user.getRole() == Role.TENANT_ADMIN ? user.getTenantId() : null
            );
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }

    public AuthResponse refreshAccessToken(String requestRefreshToken) {
        var refreshToken = refreshTokenService.findByToken(requestRefreshToken);

        if (refreshToken == null || refreshTokenService.isTokenExpired(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        var user = refreshToken.getUser();
        var newAccessToken = jwtService.generateToken(user);

        // *** FIX: Update the existing token instead of creating a new one ***
        String newRefreshToken = refreshTokenService.createOrUpdateRefreshToken(user).getToken();

        return new AuthResponse(
            newAccessToken,
            newRefreshToken,
            user.getEmail(),
            user.getRole().name(),
            user.getFullName(),
            user.getId(),
            user.getRole() == Role.TENANT_ADMIN ? user.getTenantId() : null
        );
    }

    public AuthResponse registerSuperAdmin(RegisterRequest req) {
        User admin = User.builder()
            .email(req.getEmail())
            .password(encoder.encode(req.getPassword()))
            .fullName(req.getFullName())
            .role(Role.SUPER_ADMIN)
            .build();
        userRepo.save(admin);

        // *** FIX: This is a new user, so a direct create is fine, but for consistency,
        // you could still use the createOrUpdateRefreshToken method.
        String refreshToken = refreshTokenService.createOrUpdateRefreshToken(admin).getToken();

        return new AuthResponse(
            jwtService.generateToken(admin),
            refreshToken,
            admin.getEmail(),
            admin.getRole().name(),
            admin.getFullName(),
            admin.getId(),
            null
        );
    }
}