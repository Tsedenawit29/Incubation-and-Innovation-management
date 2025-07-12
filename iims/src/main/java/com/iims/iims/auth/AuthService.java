package com.iims.iims.auth;

import com.iims.iims.auth.dto.AuthRequest;
import com.iims.iims.auth.dto.AuthResponse;
import com.iims.iims.auth.dto.RegisterRequest;
import com.iims.iims.user.Role;
import com.iims.iims.user.User;
import com.iims.iims.user.UserRepository;
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
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        var user = userRepo.findByEmail(req.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }

    public AuthResponse registerSuperAdmin(RegisterRequest req) {
        User admin = User.builder()
            .email(req.getEmail())
            .password(encoder.encode(req.getPassword()))
            .fullName(req.getFullName())
            .role(Role.SUPER_ADMIN)
            .build();
        userRepo.save(admin);
        return new AuthResponse(jwtService.generateToken(admin));
    }
} 