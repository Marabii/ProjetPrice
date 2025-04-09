package com.price.ProjetPrice.Auth.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.price.ProjetPrice.Auth.exceptions.ExpiredTokenException;
import com.price.ProjetPrice.Auth.service.JwtService;

import java.io.IOException;
import java.util.Arrays;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Autowired
    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return !path.startsWith("/api/protected/"); // Only filter paths that start with /api/protected/
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = extractToken(request);
            if (token == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "No Authorization token or invalid format");
                return;
            }
            authenticateUser(token, request);
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            handleAuthenticationException(e, response);
        }
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null) {
            if (authHeader.startsWith("Bearer ")) {
                // Remove the "Bearer " prefix and return the token
                return authHeader.substring(7);
            } else {
                return authHeader;
            }
        }

        // If no valid Authorization header, try cookies
        if (request.getCookies() != null) {
            return Arrays.stream(request.getCookies()).filter(cookie -> "jwtToken".equals(cookie.getName())).findFirst()
                    .map(Cookie::getValue).orElse(null);
        }

        return null; // No token found
    }

    private void authenticateUser(String token, HttpServletRequest request) throws Exception {
        String userEmail = jwtService.extractUsername(token);
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            if (jwtService.isTokenValid(token, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails,
                        null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                throw new SecurityException("Invalid token");
            }
        }
    }

    private void handleAuthenticationException(Exception e, HttpServletResponse response) throws IOException {
        if (e instanceof ExpiredTokenException) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Expired token");
        } else {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
        }
    }

}
