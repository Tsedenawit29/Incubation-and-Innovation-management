package com.iims.iims.auth.filter;

import com.iims.iims.auth.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        System.out.println("JWT Filter - Processing request: " + request.getMethod() + " " + request.getRequestURI());
        
        if (request.getServletPath().contains("/api/auth")) {
            System.out.println("JWT Filter - Skipping auth endpoints");
            filterChain.doFilter(request, response);
            return;
        }
        
        final String authHeader = request.getHeader("Authorization");
        System.out.println("JWT Filter - Auth header: " + (authHeader != null ? "present" : "missing"));
        
        final String jwt;
        final String userEmail;
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("JWT Filter - No valid auth header, continuing");
                filterChain.doFilter(request, response);
                return;
            }
            
            jwt = authHeader.substring(7);
            System.out.println("JWT Filter - JWT token extracted: " + (jwt != null ? "present" : "missing"));
            
            userEmail = jwtService.extractUsername(jwt);
            System.out.println("JWT Filter - Extracted username: " + userEmail);
            
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                System.out.println("JWT Filter - Loading user details for: " + userEmail);
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    System.out.println("JWT Filter - Token is valid, setting authentication");
                    System.out.println("JWT Filter - User details: " + userDetails.getUsername());
                    System.out.println("JWT Filter - User authorities: " + userDetails.getAuthorities());
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    System.out.println("JWT Filter - Authentication set successfully");
                    System.out.println("JWT Filter - Current authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
                } else {
                    System.out.println("JWT Filter - Token is invalid");
                }
            } else {
                System.out.println("JWT Filter - Username is null or authentication already exists");
            }
        } catch (Exception e) {
            System.err.println("JWT Filter - Error processing JWT: " + e.getMessage());
            e.printStackTrace();
        }
        
        filterChain.doFilter(request, response);
    }
} 