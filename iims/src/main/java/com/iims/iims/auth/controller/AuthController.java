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
        var users = userRepository.findAll();
        System.out.println("Found " + users.size() + " users in database:");
        users.forEach(user -> System.out.println("- " + user.getEmail() + " (role: " + user.getRole() + ", active: " + user.isActive() + ")"));
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/cleanup-users")
    public ResponseEntity<?> cleanupUsers() {
        var users = userRepository.findAll();
        System.out.println("Deleting " + users.size() + " users from database");
        userRepository.deleteAll();
        return ResponseEntity.ok("All users deleted. Database cleaned up.");
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok("Backend is running!");
    }

    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuth() {
        return ResponseEntity.ok("Authentication is working! You are authenticated.");
    }

    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok("Pong! Backend is accessible");
    }
} 