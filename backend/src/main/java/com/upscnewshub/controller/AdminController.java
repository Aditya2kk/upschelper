package com.upscnewshub.controller;

import com.upscnewshub.dto.ApiResponse;
import com.upscnewshub.dto.UserDto;
import com.upscnewshub.entity.User;
import com.upscnewshub.repository.UserRepository;
import com.upscnewshub.security.CustomUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null || !"ADMIN".equalsIgnoreCase(userDetails.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied. Only Administrators can view registered user directory and IP logs.", "FORBIDDEN", "/api/admin/users"));
        }

        List<UserDto> users = userRepository.findAll().stream()
                .sorted((a, b) -> {
                    if (a.getLastLoginAt() != null && b.getLastLoginAt() != null) {
                        return b.getLastLoginAt().compareTo(a.getLastLoginAt());
                    }
                    if (a.getLastLoginAt() != null) return -1;
                    if (b.getLastLoginAt() != null) return 1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole())
                        .avatarUrl(u.getAvatarUrl())
                        .lastLoginAt(u.getLastLoginAt())
                        .lastLoginIp(u.getLastLoginIp() != null ? u.getLastLoginIp() : "127.0.0.1")
                        .userAgent(u.getUserAgent() != null ? u.getUserAgent() : "Browser / Web Client")
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }
}
