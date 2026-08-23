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

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    // Brute-force protection: track failed attempts per email
    private final Map<String, Integer> failedAttempts = new ConcurrentHashMap<>();
    private final Map<String, Instant> lockoutExpiry = new ConcurrentHashMap<>();
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_SECONDS = 300; // 5 minutes

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
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

        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("USER")
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
    public AuthResponse login(LoginRequest request) {
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
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new BadRequestException("Refresh token has expired. Please sign in again");
        }

        User user = refreshToken.getUser();
        String newAccessToken = tokenProvider.generateTokenFromUserId(user.getId(), user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
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
                .createdAt(user.getCreatedAt())
                .build();
    }
}
