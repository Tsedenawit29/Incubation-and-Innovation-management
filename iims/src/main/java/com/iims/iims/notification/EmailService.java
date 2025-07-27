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

    public void sendAdminApprovalEmail(String to, String name, String username, String password, String tenantName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Account Created for " + tenantName);
        message.setText(
            "Hello " + name + ",\n\n" +
            "An administrator account has been created for you for the tenant '" + tenantName + "'.\n\n" +
            "Your login credentials are:\n" +
            "Username: " + username + "\n" +
            "Password: " + password + "\n\n" +
            "Please log in and change your password immediately.\n\n" +
            "Thank you,\n" +
            "The IIMS Team"
        );
        mailSender.send(message);
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

    public void sendUserAccountEmail(String to, String name, String username, String password, String tenantName, String role) {
        String prettyRole = role.substring(0, 1).toUpperCase() + role.substring(1).toLowerCase();
        String subject = "Your " + prettyRole + " Account for " + tenantName;
        String message = String.format(
            "Hello %s,\n\n" +
            "A %s account has been created for you for the tenant '%s'.\n\n" +
            "Your login credentials are:\n" +
            "Username: %s\n" +
            "Password: %s\n\n" +
            "Please log in and change your password immediately.\n\n" +
            "Login URL: http://localhost:3000/login\n\n" +
            "Thank you,\nThe IIMS Team",
            name, prettyRole, tenantName, username, password
        );
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(to);
        mailMessage.setSubject(subject);
        mailMessage.setText(message);
        mailSender.send(mailMessage);
    }
} 