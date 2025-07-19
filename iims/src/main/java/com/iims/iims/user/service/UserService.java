package com.iims.iims.user.service;

import com.iims.iims.user.entity.User;
import com.iims.iims.user.entity.Role;
import com.iims.iims.user.repository.UserRepository;
import com.iims.iims.user.dto.UserProfileUpdateRequest;
import com.iims.iims.user.dto.PasswordUpdateRequest;
import com.iims.iims.user.dto.TenantUserCreationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import org.apache.commons.lang3.RandomStringUtils;
import com.iims.iims.tenant.entity.Tenant;
import com.iims.iims.tenant.repository.TenantRepository;
import com.iims.iims.notification.EmailService;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final EmailService emailService;
    private final TenantRepository tenantRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public User updateUser(UUID id, User userDetails) {
        User user = getUserById(id);
        user.setFullName(userDetails.getFullName());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());
        user.setActive(userDetails.isActive());
        return userRepository.save(user);
    }

    public User updateUserProfile(UUID id, UserProfileUpdateRequest request) {
        User user = getUserById(id);
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        return userRepository.save(user);
    }

    public void updateUserPassword(UUID id, PasswordUpdateRequest request) {
        User user = getUserById(id);
        // Verify current password
        if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        // Update to new password
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public User updateUserStatus(UUID id, boolean isActive) {
        User user = getUserById(id);
        user.setActive(isActive);
        return userRepository.save(user);
    }

    public User createUser(User user) {
        // Ensure email is unique
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        // Encode password
        user.setPassword(encoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User updateUserRole(UUID id, Role role) {
        User user = getUserById(id);
        user.setRole(role);
        return userRepository.save(user);
    }

    public User createTenantUser(TenantUserCreationRequest request, User tenantAdmin) {
        // Ensure email is unique
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        // Generate random password
        String rawPassword = RandomStringUtils.randomAlphanumeric(10);
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .role(request.getRole())
                .tenantId(tenantAdmin.getTenantId())
                .password(encoder.encode(rawPassword))
                .isActive(true)
                .build();
        userRepository.save(user);
        // Get tenant name for email
        Tenant tenant = tenantRepository.findById(tenantAdmin.getTenantId())
                .orElse(null);
        String tenantName = tenant != null ? tenant.getName() : "Your Center";
        // Send email with credentials
        emailService.sendAdminApprovalEmail(user.getEmail(), user.getFullName(), user.getEmail(), rawPassword, tenantName);
        // Return user info without password
        user.setPassword(null);
        return user;
    }

    public List<User> getUsersByTenantId(UUID tenantId) {
        return userRepository.findByTenantId(tenantId);
    }

    public List<User> getUsersByTenantIdAndRole(UUID tenantId, Role role) {
        return userRepository.findByTenantIdAndRole(tenantId, role);
    }
} 