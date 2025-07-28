package com.iims.iims.config;

import com.iims.iims.user.entity.Role;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if any users exist
        if (userRepository.count() == 0) {
            log.info("No users found in database. Creating default super admin...");
            
            User superAdmin = User.builder()
                .email("admin@iims.com")
                .password(passwordEncoder.encode("123456"))
                .fullName("Super Admin")
                .role(Role.SUPER_ADMIN)
                .isActive(true)
                .build();
            
            userRepository.save(superAdmin);
            log.info("Default super admin created with email: admin@iims.com and password: 123456");
        } else {
            log.info("Users already exist in database. Skipping default user creation.");
        }
    }
} 