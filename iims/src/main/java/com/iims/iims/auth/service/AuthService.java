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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public AuthResponse authenticate(AuthRequest req) {
        try {
            System.out.println("Attempting to authenticate user: " + req.getEmail());
            
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );

            var user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("User authenticated successfully: " + user.getEmail() + " with role: " + user.getRole());
            
            String token = jwtService.generateToken(user);
            return new AuthResponse(token, user.getEmail(), user.getRole().name(), user.getFullName(), user.getId());
        } catch (Exception e) {
            System.err.println("Authentication failed for user " + req.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }

    public AuthResponse registerSuperAdmin(RegisterRequest req) {
        User admin = User.builder()
            .email(req.getEmail())
            .password(encoder.encode(req.getPassword()))
            .fullName(req.getFullName())
            .role(Role.SUPER_ADMIN)
            .build();
        userRepo.save(admin);
        return new AuthResponse(jwtService.generateToken(admin), admin.getEmail(), admin.getRole().name(), admin.getFullName(), admin.getId());
    }
} 