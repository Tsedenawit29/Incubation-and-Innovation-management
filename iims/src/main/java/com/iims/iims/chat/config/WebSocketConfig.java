package com.iims.iims.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtWebSocketInterceptor jwtWebSocketInterceptor;

    public WebSocketConfig(JwtWebSocketInterceptor jwtWebSocketInterceptor) {
        this.jwtWebSocketInterceptor = jwtWebSocketInterceptor;
    }

    // ... your other methods (configureMessageBroker, registerStompEndpoints)

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