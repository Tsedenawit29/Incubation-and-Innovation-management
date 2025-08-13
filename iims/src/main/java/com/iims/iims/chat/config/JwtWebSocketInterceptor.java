package com.iims.iims.chat.config;

import com.iims.iims.auth.service.JwtService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Interceptor to validate the JWT token during the WebSocket handshake.
 * It extracts the token from the STOMP headers and authenticates the user.
 */
@Component
public class JwtWebSocketInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Constructs the JwtWebSocketInterceptor with the JWT provider and user details service.
     *
     * @param jwtService The service for JWT token validation and parsing.
     * @param userDetailsService The service for loading user details.
     */
    public JwtWebSocketInterceptor(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Intercepts messages before they are sent to the channel.
     *
     * @param message The message to be intercepted.
     * @param channel The message channel.
     * @return The message, potentially with added authentication details.
     */
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(Objects.requireNonNull(accessor).getCommand())) {
            String authorizationHeader = accessor.getFirstNativeHeader("Authorization");

            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                String token = authorizationHeader.substring(7);

                try {
                    String username = jwtService.extractUsername(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    if (jwtService.isTokenValid(token, userDetails)) {
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());

                        accessor.setUser(authentication);
                    }
                } catch (Exception e) {
                    // Log the exception for debugging, but don't crash the application.
                    // This will prevent the user from connecting via WebSocket.
                    System.err.println("JWT token validation failed: " + e.getMessage());
                }
            }
        }
        return message;
    }
}