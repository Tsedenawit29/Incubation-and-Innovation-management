package com.iims.iims.chat.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuration class to enable and configure WebSocket support.
 * It sets up the message broker and STOMP endpoints for client connections.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtWebSocketInterceptor jwtWebSocketInterceptor;

    /**
     * Constructs the WebSocketConfig with the JWT WebSocket interceptor.
     *
     * @param jwtWebSocketInterceptor The interceptor to secure WebSocket connections.
     */
    public WebSocketConfig(JwtWebSocketInterceptor jwtWebSocketInterceptor) {
        this.jwtWebSocketInterceptor = jwtWebSocketInterceptor;
    }

    /**
     * Configures the message broker for routing messages to clients.
     * It enables a simple in-memory message broker for topics and user queues.
     *
     * @param registry The MessageBrokerRegistry to configure.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enables a simple in-memory message broker.
        // "/topic" prefix is for general subscriptions (e.g., group chats).
        // "/user" prefix is for private messages.
        registry.enableSimpleBroker("/topic", "/user");

        // Defines the prefix for all messages coming from clients to the server.
        registry.setApplicationDestinationPrefixes("/app");

        // Defines the prefix for private user-specific destinations.
        registry.setUserDestinationPrefix("/user");
    }

    /**
     * Registers the STOMP endpoint for WebSocket connections.
     * This is the URL that clients will connect to.
     *
     * @param registry The StompEndpointRegistry to configure.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registers the "/ws" endpoint, enabling SockJS for fallback.
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }

    /**
     * Configures the client inbound channel to add an interceptor.
     * This is where the JWT token is validated during the WebSocket handshake.
     *
     * @param registration The ChannelRegistration to configure.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(jwtWebSocketInterceptor);
    }
}