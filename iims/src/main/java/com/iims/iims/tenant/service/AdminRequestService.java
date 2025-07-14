package com.iims.iims.tenant.service;

import com.iims.iims.tenant.entity.AdminRequest;
import com.iims.iims.tenant.entity.AdminRequestStatus;
import com.iims.iims.tenant.entity.Tenant;
import com.iims.iims.tenant.entity.TenantStatus;
import com.iims.iims.tenant.repository.AdminRequestRepository;
import com.iims.iims.tenant.repository.TenantRepository;
import com.iims.iims.user.entity.Role;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import com.iims.iims.user.dto.AdminRegistrationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminRequestService {

    private final AdminRequestRepository adminRequestRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminRequest createAdminRequest(AdminRegistrationRequest requestDto) {
        // Check if tenant exists and is approved
        Tenant tenant = tenantRepository.findById(requestDto.getTenantId())
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        
        if (tenant.getStatus() != TenantStatus.APPROVED) {
            throw new RuntimeException("Tenant is not approved");
        }

        // Check if admin with same email already exists
        if (adminRequestRepository.existsByEmail(requestDto.getEmail())) {
            throw new RuntimeException("Admin request with this email already exists");
        }

        // Check if user with same email already exists
        if (userRepository.findByEmail(requestDto.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        AdminRequest adminRequest = AdminRequest.builder()
                .fullName(requestDto.getFullName())
                .email(requestDto.getEmail())
                .phone(requestDto.getPhone())
                .position(requestDto.getPosition())
                .tenantId(requestDto.getTenantId())
                .status(AdminRequestStatus.PENDING)
                .build();

        return adminRequestRepository.save(adminRequest);
    }

    public List<AdminRequest> getPendingAdminRequests() {
        return adminRequestRepository.findByStatus(AdminRequestStatus.PENDING);
    }

    public List<AdminRequest> getAllAdminRequests() {
        return adminRequestRepository.findAll();
    }

    public AdminRequest getAdminRequestById(UUID id) {
        return adminRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin request not found with id: " + id));
    }

    public User approveAdminRequest(UUID requestId, UUID approvedBy) {
        AdminRequest adminRequest = getAdminRequestById(requestId);
        
        if (adminRequest.getStatus() != AdminRequestStatus.PENDING) {
            throw new RuntimeException("Admin request is not in pending status");
        }

        // Generate a random password
        String generatedPassword = generateRandomPassword();
        
        // Create the user
        User user = User.builder()
                .fullName(adminRequest.getFullName())
                .email(adminRequest.getEmail())
                .password(passwordEncoder.encode(generatedPassword))
                .role(Role.TENANT_ADMIN)
                .tenantId(adminRequest.getTenantId())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // Update admin request status
        adminRequest.setStatus(AdminRequestStatus.APPROVED);
        adminRequest.setApprovedAt(LocalDateTime.now());
        adminRequest.setApprovedBy(approvedBy);
        adminRequest.setGeneratedPassword(generatedPassword);
        adminRequestRepository.save(adminRequest);

        // Send email with credentials (for now, just log)
        sendAdminCredentialsEmail(adminRequest.getEmail(), adminRequest.getFullName(), generatedPassword);

        return savedUser;
    }

    public AdminRequest rejectAdminRequest(UUID requestId, UUID rejectedBy, String reason) {
        AdminRequest adminRequest = getAdminRequestById(requestId);
        
        if (adminRequest.getStatus() != AdminRequestStatus.PENDING) {
            throw new RuntimeException("Admin request is not in pending status");
        }

        adminRequest.setStatus(AdminRequestStatus.REJECTED);
        // You might want to store the rejection reason somewhere

        return adminRequestRepository.save(adminRequest);
    }

    private String generateRandomPassword() {
        // Generate a random 8-character password
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            password.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        return password.toString();
    }

    private void sendAdminCredentialsEmail(String email, String fullName, String password) {
        // For now, just log the credentials
        // In a real application, you would send an email here
        System.out.println("=== ADMIN CREDENTIALS EMAIL ===");
        System.out.println("To: " + email);
        System.out.println("Subject: Your IIMS Admin Account Credentials");
        System.out.println("Body:");
        System.out.println("Dear " + fullName + ",");
        System.out.println("Your admin account has been approved. Here are your login credentials:");
        System.out.println("Email: " + email);
        System.out.println("Password: " + password);
        System.out.println("Please change your password after your first login.");
        System.out.println("Best regards,");
        System.out.println("IIMS Team");
        System.out.println("================================");
    }
} 