package com.iims.iims.config;

import com.iims.iims.auth.filter.JwtAuthFilter;
import com.iims.iims.user.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    public SecurityConfig() {
    }

    @Bean
    public HttpFirewall httpFirewall() {
        StrictHttpFirewall firewall = new StrictHttpFirewall();
        firewall.setAllowUrlEncodedDoubleSlash(true);
        firewall.setAllowUrlEncodedPercent(true);
        firewall.setAllowUrlEncodedPeriod(true);
        firewall.setAllowBackSlash(true);
        firewall.setAllowUrlEncodedSlash(true);
        return firewall;
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.httpFirewall(httpFirewall());
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter, UserService userService) throws Exception {
        System.out.println("SecurityConfig - Configuring security filter chain");

        return http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authorize -> authorize
                        // Public endpoints (no authentication required)
                        .requestMatchers("/api/auth/**", "/ping").permitAll()
                        .requestMatchers("/api/tenant/apply").permitAll()
                        .requestMatchers("/api/users/request-admin").permitAll()
                        // Allow SockJS/WebSocket handshake and info endpoints
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Allow CORS preflight
                        .requestMatchers("/api/v1/applications/submit").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/v1/news/**").permitAll()
                        
                        // Tenant-related endpoints
                        .requestMatchers(HttpMethod.GET, "/api/tenants/**").permitAll()
                        .requestMatchers("/api/tenant/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/tenant-admin/**").hasRole("TENANT_ADMIN")
                        
                        // Landing page endpoints - ALL GET requests to landing page should be public
                        .requestMatchers(HttpMethod.GET, "/api/tenants/*/landing-page/**").permitAll()
                        .requestMatchers("/api/tenants/*/landing-page/**").hasAnyRole("SUPER_ADMIN", "TENANT_ADMIN")
                        
                        // Progress tracking endpoints
                        .requestMatchers(HttpMethod.GET, "/api/progresstracking/templates/**").hasAnyRole("TENANT_ADMIN", "STARTUP", "MENTOR")
                        .requestMatchers("/api/progresstracking/templates/**").hasRole("TENANT_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/progresstracking/phases/**").hasAnyRole("TENANT_ADMIN", "STARTUP", "MENTOR")
                        .requestMatchers("/api/progresstracking/phases/**").hasRole("TENANT_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/progresstracking/tasks/**").hasAnyRole("TENANT_ADMIN", "STARTUP", "MENTOR")
                        .requestMatchers("/api/progresstracking/tasks/**").hasRole("TENANT_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/progresstracking/assignments/**").hasAnyRole("TENANT_ADMIN", "STARTUP", "MENTOR")
                        .requestMatchers("/api/progresstracking/assignments/**").hasRole("TENANT_ADMIN")
                        .requestMatchers("/api/progresstracking/submissions/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/progresstracking/submission-files/upload").hasAnyRole("TENANT_ADMIN", "STARTUP", "MENTOR")
                        .requestMatchers("/api/progresstracking/**").authenticated()
                        .requestMatchers("/api/v1/applications/submit").permitAll()
                        .requestMatchers("/api/v1/public/application-forms/*").permitAll()
                        
                        // User management endpoints
                        .requestMatchers("/api/users/pending-admins", "/api/users/admin-requests", "/api/users/approve-admin/**", "/api/users/reject-admin/**").hasRole("SUPER_ADMIN")
                        
                        // Profile endpoints
                        .requestMatchers("/api/profile/startup/**").hasAnyRole("STARTUP", "TENANT_ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/profile/alumni/**").hasAnyRole("ALUMNI", "TENANT_ADMIN", "SUPER_ADMIN")
                        
                        // Alumni endpoints (legacy - keeping for backward compatibility)
                        .requestMatchers("/api/alumni/**").hasAnyRole("ALUMNI", "TENANT_ADMIN", "SUPER_ADMIN")
                        
                        .requestMatchers("/api/google/callback").permitAll()
                        .requestMatchers("/api/google/auth-url").permitAll()
                        .requestMatchers("/api/google/**").permitAll()
                        .requestMatchers("/api/meetings/**").permitAll()
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider(userService))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserService userService) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
