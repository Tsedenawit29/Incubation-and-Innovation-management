package com.iims.iims.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

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

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(tenantEmail);
        mailMessage.setSubject(subject);
        mailMessage.setText(message);
        mailSender.send(mailMessage);
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

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(tenantEmail);
        mailMessage.setSubject(subject);
        mailMessage.setText(message);
        mailSender.send(mailMessage);
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

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(adminEmail);
        mailMessage.setSubject(subject);
        mailMessage.setText(message);
        mailSender.send(mailMessage);
    }

    public void sendAdminRejectionEmail(String adminEmail, String adminName, String tenantName, String reason) {
        String subject = "Admin Application Update - IIMS";
        String message = String.format("""
            Dear %s,

            Thank you for your interest in being an admin for %s. After careful review, we regret to inform you that your admin application has not been approved at this time.

            Reason: %s

            You may reapply in the future with updated information.

            If you have any questions, please contact the system administrator.

            Best regards,
            IIMS Team
            """, adminName, tenantName, reason);

        log.info("Sending admin rejection email to: {}", adminEmail);
        log.info("Email subject: {}", subject);
        log.info("Email content: {}", message);

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(adminEmail);
        mailMessage.setSubject(subject);
        mailMessage.setText(message);
        mailSender.send(mailMessage);
    }

    public void sendStartupCredentialsEmail(String startupEmail, String startupName, String username, String password, String tenantName) {
        String subject = "Welcome to IIMS - Your Startup Account Credentials";
        String message = String.format("""
            Dear %s,
            
            Welcome to the IIMS platform! Your startup account has been created for %s.
            
            Login Credentials:
            - Username: %s
            - Password: %s
            
            Please log in and change your password after your first login.
            
            Login URL: http://localhost:3000/login
            
            If you have any questions or need support, please contact your tenant admin or the IIMS support team.
            
            Best regards,
            IIMS Team
            """, startupName, tenantName, username, password);

        log.info("Sending startup credentials email to: {}", startupEmail);
        log.info("Email subject: {}", subject);
        log.info("Email content: {}", message);

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(startupEmail);
        mailMessage.setSubject(subject);
        mailMessage.setText(message);
        mailSender.send(mailMessage);
    }
} 