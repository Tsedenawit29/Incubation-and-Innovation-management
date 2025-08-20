package com.iims.iims.user.repository;

import com.iims.iims.user.entity.User;
import com.iims.iims.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByTenantId(UUID tenantId);
    List<User> findByTenantIdAndRole(UUID tenantId, Role role);
    
    // New methods for analytics
    @Query("SELECT COUNT(u) FROM User u WHERE u.tenantId = :tenantId AND u.createdAt BETWEEN :startDate AND :endDate")
    Long countByTenantIdAndCreatedAtBetween(
            @Param("tenantId") UUID tenantId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.tenantId = :tenantId AND u.role = :role AND u.createdAt BETWEEN :startDate AND :endDate")
    Long countByTenantIdAndRoleAndCreatedAtBetween(
            @Param("tenantId") UUID tenantId,
            @Param("role") Role role,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT u FROM User u WHERE u.tenantId = :tenantId AND u.lastLogin IS NOT NULL AND CAST(u.lastLogin AS date) BETWEEN :startDate AND :endDate")
    List<User> findActiveUsersByTenantIdAndDateRange(
            @Param("tenantId") UUID tenantId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.tenantId = :tenantId AND u.isActive = true")
    Long countActiveUsersByTenantId(@Param("tenantId") UUID tenantId);
    
    @Query("SELECT FUNCTION('date', u.createdAt) AS day, COUNT(u) AS cnt " +
           "FROM User u WHERE u.tenantId = :tenantId " +
           "AND CAST(u.createdAt AS date) BETWEEN :startDate AND :endDate " +
           "GROUP BY FUNCTION('date', u.createdAt) " +
           "ORDER BY day")
    java.util.List<com.iims.iims.user.repository.UserRepository.DateCountProjection> countNewUsersByDateRange(
            @Param("tenantId") UUID tenantId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    interface DateCountProjection {
        LocalDate getDay();
        Long getCnt();
    }
} 