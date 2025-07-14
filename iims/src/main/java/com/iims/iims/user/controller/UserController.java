package com.iims.iims.user.controller;

import com.iims.iims.user.entity.User;
import com.iims.iims.user.entity.Role;
import com.iims.iims.user.service.UserService;
import com.iims.iims.user.dto.UserProfileUpdateRequest;
import com.iims.iims.user.dto.PasswordUpdateRequest;
import com.iims.iims.user.dto.StatusUpdateRequest;
import com.iims.iims.user.dto.AdminRegistrationRequest;
import com.iims.iims.tenant.entity.AdminRequest;
import com.iims.iims.tenant.service.AdminRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AdminRequestService adminRequestService;

    // CREATE user with any role
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    // GET all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // GET users by role
    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    // GET super admins only
    @GetMapping("/super-admins")
    public ResponseEntity<List<User>> getSuperAdmins() {
        return ResponseEntity.ok(userService.getUsersByRole(Role.SUPER_ADMIN));
    }

    // GET user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // GET user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    // UPDATE user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable UUID id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    // UPDATE user profile (name, email only)
    @PutMapping("/{id}/profile")
    public ResponseEntity<User> updateUserProfile(@PathVariable UUID id, @RequestBody UserProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUserProfile(id, request));
    }

    // UPDATE user password
    @PutMapping("/{id}/password")
    public ResponseEntity<Object> updateUserPassword(@PathVariable UUID id, @RequestBody PasswordUpdateRequest request) {
        userService.updateUserPassword(id, request);
        return ResponseEntity.ok().body(Map.of("message", "Password updated successfully"));
    }

    // PATCH user status (activate/deactivate)
    @PatchMapping("/{id}/status")
    public ResponseEntity<User> updateUserStatus(@PathVariable UUID id, @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUserStatus(id, request.isActive()));
    }

    // UPDATE user role
    @PutMapping("/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable UUID id, @RequestBody Role role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    // DELETE user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ========== ADMIN REQUEST ENDPOINTS ==========

    // Request admin registration (public endpoint)
    @PostMapping("/request-admin")
    public ResponseEntity<AdminRequest> requestAdmin(@RequestBody AdminRegistrationRequest requestDto) {
        AdminRequest adminRequest = adminRequestService.createAdminRequest(requestDto);
        return ResponseEntity.ok(adminRequest);
    }

    // Get all pending admin requests (super admin only)
    @GetMapping("/pending-admins")
    public ResponseEntity<List<AdminRequest>> getPendingAdminRequests() {
        List<AdminRequest> pendingRequests = adminRequestService.getPendingAdminRequests();
        return ResponseEntity.ok(pendingRequests);
    }

    // Get all admin requests (super admin only)
    @GetMapping("/admin-requests")
    public ResponseEntity<List<AdminRequest>> getAllAdminRequests() {
        List<AdminRequest> allRequests = adminRequestService.getAllAdminRequests();
        return ResponseEntity.ok(allRequests);
    }

    // Get admin request by ID
    @GetMapping("/admin-requests/{id}")
    public ResponseEntity<AdminRequest> getAdminRequestById(@PathVariable UUID id) {
        AdminRequest adminRequest = adminRequestService.getAdminRequestById(id);
        return ResponseEntity.ok(adminRequest);
    }

    // Approve admin request (super admin only)
    @PostMapping("/approve-admin/{id}")
    public ResponseEntity<User> approveAdminRequest(
            @PathVariable UUID id,
            @RequestParam UUID approvedBy) {
        User user = adminRequestService.approveAdminRequest(id, approvedBy);
        return ResponseEntity.ok(user);
    }

    // Reject admin request (super admin only)
    @PostMapping("/reject-admin/{id}")
    public ResponseEntity<AdminRequest> rejectAdminRequest(
            @PathVariable UUID id,
            @RequestParam UUID rejectedBy,
            @RequestParam String reason) {
        AdminRequest adminRequest = adminRequestService.rejectAdminRequest(id, rejectedBy, reason);
        return ResponseEntity.ok(adminRequest);
    }

    // Debug endpoint to check current user's role
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();
        
        if (auth != null && auth.getPrincipal() instanceof User) {
            User user = (User) auth.getPrincipal();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("role", user.getRole());
            response.put("authorities", user.getAuthorities());
            response.put("isActive", user.isActive());
        } else {
            response.put("error", "No authenticated user found");
            response.put("principal", auth != null ? auth.getPrincipal() : "null");
            response.put("authorities", auth != null ? auth.getAuthorities() : "null");
        }
        
        return ResponseEntity.ok(response);
    }

    // Simple test endpoint to check authentication
    @GetMapping("/test-auth")
    public ResponseEntity<Map<String, Object>> testAuth() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();
        
        response.put("authenticated", auth != null && auth.isAuthenticated());
        response.put("principal", auth != null ? auth.getPrincipal() : "null");
        response.put("authorities", auth != null ? auth.getAuthorities() : "null");
        response.put("name", auth != null ? auth.getName() : "null");
        
        return ResponseEntity.ok(response);
    }

    // Debug endpoint to check and fix user roles
    @GetMapping("/debug/check-role/{email}")
    public ResponseEntity<Map<String, Object>> checkUserRole(@PathVariable String email) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            User user = userService.getUserByEmail(email);
            response.put("user", user);
            response.put("role", user.getRole());
            response.put("authorities", user.getAuthorities());
            response.put("isActive", user.isActive());
            
            // Check if role needs to be updated
            if (user.getRole() != Role.SUPER_ADMIN) {
                response.put("warning", "User is not SUPER_ADMIN. Current role: " + user.getRole());
                response.put("suggestion", "Update user role to SUPER_ADMIN");
            } else {
                response.put("status", "User has correct SUPER_ADMIN role");
            }
            
        } catch (Exception e) {
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    // Debug endpoint to fix user role
    @PutMapping("/debug/fix-role/{email}")
    public ResponseEntity<Map<String, Object>> fixUserRole(@PathVariable String email) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            User user = userService.getUserByEmail(email);
            user.setRole(Role.SUPER_ADMIN);
            User updatedUser = userService.saveUser(user);
            
            response.put("success", true);
            response.put("message", "User role updated to SUPER_ADMIN");
            response.put("user", updatedUser);
            response.put("newAuthorities", updatedUser.getAuthorities());
            
        } catch (Exception e) {
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
} 