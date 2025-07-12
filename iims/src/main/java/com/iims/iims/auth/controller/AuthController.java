package com.iims.iims.auth.controller;

import com.iims.iims.auth.dto.AuthRequest;
import com.iims.iims.auth.dto.AuthResponse;
import com.iims.iims.auth.dto.RegisterRequest;
import com.iims.iims.auth.service.AuthService;
import com.iims.iims.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        return ResponseEntity.ok(authService.authenticate(req));
    }

    @PostMapping("/register-super-admin")
    public ResponseEntity<?> registerSuperAdmin(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.registerSuperAdmin(req));
    }

    @GetMapping("/test-users")
    public ResponseEntity<?> testUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
} 