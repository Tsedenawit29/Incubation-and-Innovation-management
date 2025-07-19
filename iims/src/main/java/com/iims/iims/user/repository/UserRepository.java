package com.iims.iims.user.repository;

import com.iims.iims.user.entity.User;
import com.iims.iims.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByTenantId(UUID tenantId);
    List<User> findByTenantIdAndRole(UUID tenantId, Role role);
} 