package com.upscnewshub.service;

import com.upscnewshub.dto.*;
import com.upscnewshub.entity.RefreshToken;
import com.upscnewshub.entity.User;
import com.upscnewshub.exception.BadRequestException;
import com.upscnewshub.repository.RefreshTokenRepository;
import com.upscnewshub.repository.UserRepository;
import com.upscnewshub.security.CustomUserDetails;
import com.upscnewshub.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserLoginAuditRepository userLoginAuditRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    @Value("${app.security.admin-secret:UPSC_ADMIN_2026}")
    private String adminSecret;

    // Brute-force protection: track failed attempts per email
    private final Map<String, Integer> failedAttempts = new ConcurrentHashMap<>();
    private final Map<String, Instant> lockoutExpiry = new ConcurrentHashMap<>();
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_SECONDS = 300; // 5 minutes

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       UserLoginAuditRepository userLoginAuditRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userLoginAuditRepository = userLoginAuditRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        String userRole = "USER";
        if (request.getAdminSecret() != null && !request.getAdminSecret().trim().isEmpty()) {
            if (request.getAdminSecret().trim().equals(adminSecret)) {
                userRole = "ADMIN";
                log.info("Registering user '{}' with verified ADMIN role.", normalizedEmail);
            } else {
                throw new BadRequestException("Invalid Admin Secret Key. Please check your admin passphrase.");
            }
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .lastLoginAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);

        String accessToken = tokenProvider.generateTokenFromUserId(user.getId(), user.getEmail(), user.getRole());
        RefreshToken refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .user(mapToUserDto(user))
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String clientIp, String userAgent) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // Check if account is temporarily locked out due to excessive failed attempts
        Instant lockoutUntil = lockoutExpiry.get(normalizedEmail);
        if (lockoutUntil != null) {
            if (Instant.now().isBefore(lockoutUntil)) {
                long remainingSeconds = lockoutUntil.getEpochSecond() - Instant.now().getEpochSecond();
                long remainingMinutes = Math.max(1, (remainingSeconds + 59) / 60);
                throw new BadRequestException("Too many failed login attempts. Please try again in " + remainingMinutes + " minute(s).");
            } else {
                // Lockout period expired
                lockoutExpiry.remove(normalizedEmail);
                failedAttempts.remove(normalizedEmail);
            }
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );
            // Login successful: reset failed attempt counters
            failedAttempts.remove(normalizedEmail);
            lockoutExpiry.remove(normalizedEmail);
        } catch (BadCredentialsException ex) {
            // Track failed attempt
            int attempts = failedAttempts.getOrDefault(normalizedEmail, 0) + 1;
            failedAttempts.put(normalizedEmail, attempts);

            if (attempts >= MAX_FAILED_ATTEMPTS) {
                lockoutExpiry.put(normalizedEmail, Instant.now().plusSeconds(LOCKOUT_DURATION_SECONDS));
                throw new BadRequestException("Too many failed login attempts. Account temporarily locked for 5 minutes.");
            }

            throw new BadCredentialsException("Invalid email or password");
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        // Record last login timestamp, IP address, and User-Agent
        user.setLastLoginAt(LocalDateTime.now());
        if (clientIp != null && !clientIp.isEmpty()) {
            user.setLastLoginIp(clientIp);
        }
        if (userAgent != null && !userAgent.isEmpty()) {
            user.setUserAgent(userAgent.length() > 490 ? userAgent.substring(0, 490) : userAgent);
        }
        user = userRepository.save(user);

        // Record login audit event
        try {
            UserLoginAudit audit = new UserLoginAudit(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                clientIp,
                userAgent
            );
            userLoginAuditRepository.save(audit);
        } catch (Exception e) {
            log.warn("Could not save login audit log: {}", e.getMessage());
        }

        String accessToken = tokenProvider.generateToken(authentication);

        // Delete old refresh tokens for user
        refreshTokenRepository.deleteByUserId(user.getId());
        RefreshToken refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .user(mapToUserDto(user))
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        return login(request, null, null);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new BadRequestException("Refresh token has expired. Please sign in again");
        }

        User user = refreshToken.getUser();
        String accessToken = tokenProvider.generateTokenFromUserId(user.getId(), user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .user(mapToUserDto(user))
                .build();
    }

    @Transactional
    public void logout(UUID userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        return mapToUserDto(user);
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plusNanos(refreshExpirationMs * 1_000_000))
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .lastLoginAt(user.getLastLoginAt())
                .lastLoginIp(user.getLastLoginIp())
                .userAgent(user.getUserAgent())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
