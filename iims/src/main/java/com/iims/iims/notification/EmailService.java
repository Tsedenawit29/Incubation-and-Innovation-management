package com.iims.iims.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    public void sendTenantApprovalEmail(String tenantEmail, String tenantName, String tenantId, String adminRegistrationUrl) {
        String subject = "Tenant Application Approved - IIMS";
        String message = String.format("""
            Dear %s,
            
            Congratulations! Your tenant application has been approved.
            
            Tenant Details:
            - Name: %s
            - Tenant ID: %s
            
            Next Steps:
            1. Use your Tenant ID to register admin users for your organization
            2. Share the admin registration URL with your team members
            3. Admins will receive login credentials upon approval
            
            Admin Registration URL: %s
            
            If you have any questions, please contact the system administrator.
            
            Best regards,
            IIMS Team
            """, tenantName, tenantName, tenantId, adminRegistrationUrl);
        
        log.info("Sending tenant approval email to: {}", tenantEmail);
        log.info("Email subject: {}", subject);
        log.info("Email content: {}", message);
        
        // TODO: Implement actual email sending logic
        // For now, we just log the email content
    }

    public void sendTenantRejectionEmail(String tenantEmail, String tenantName, String reason) {
        String subject = "Tenant Application Update - IIMS";
        String message = String.format("""
            Dear %s,
            
            Thank you for your interest in IIMS. After careful review, we regret to inform you that your tenant application has not been approved at this time.
            
            Reason: %s
            
            You may reapply in the future with updated information.
            
            If you have any questions, please contact the system administrator.
            
            Best regards,
            IIMS Team
            """, tenantName, reason);
        
        log.info("Sending tenant rejection email to: {}", tenantEmail);
        log.info("Email subject: {}", subject);
        log.info("Email content: {}", message);
        
        // TODO: Implement actual email sending logic
        // For now, we just log the email content
    }

    public void sendAdminApprovalEmail(String adminEmail, String adminName, String username, String password, String tenantName) {
        String subject = "Admin Account Created - IIMS";
        String message = String.format("""
            Dear %s,
            
            Your admin account has been created successfully for %s.
            
            Login Credentials:
            - Username: %s
            - Password: %s
            
            Please change your password after your first login.
            
            Login URL: http://localhost:3000/login
            
            If you have any questions, please contact the system administrator.
            
            Best regards,
            IIMS Team
            """, adminName, tenantName, username, password);
        
        log.info("Sending admin approval email to: {}", adminEmail);
        log.info("Email subject: {}", subject);
        log.info("Email content: {}", message);
        
        // TODO: Implement actual email sending logic
        // For now, we just log the email content
    }
} 