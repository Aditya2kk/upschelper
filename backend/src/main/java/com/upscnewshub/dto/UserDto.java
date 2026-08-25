package com.upscnewshub.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserDto {

    private UUID id;
    private String name;
    private String email;
    private String role;
    private String avatarUrl;
    private LocalDateTime lastLoginAt;
    private String lastLoginIp;
    private String userAgent;
    private LocalDateTime createdAt;

    public UserDto() {}

    public UserDto(UUID id, String name, String email, String role, String avatarUrl, LocalDateTime lastLoginAt, String lastLoginIp, String userAgent, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.avatarUrl = avatarUrl;
        this.lastLoginAt = lastLoginAt;
        this.lastLoginIp = lastLoginIp;
        this.userAgent = userAgent;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public String getLastLoginIp() { return lastLoginIp; }
    public void setLastLoginIp(String lastLoginIp) { this.lastLoginIp = lastLoginIp; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String name;
        private String email;
        private String role;
        private String avatarUrl;
        private LocalDateTime lastLoginAt;
        private String lastLoginIp;
        private String userAgent;
        private LocalDateTime createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder role(String role) { this.role = role; return this; }
        public Builder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public Builder lastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; return this; }
        public Builder lastLoginIp(String lastLoginIp) { this.lastLoginIp = lastLoginIp; return this; }
        public Builder userAgent(String userAgent) { this.userAgent = userAgent; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public UserDto build() {
            return new UserDto(id, name, email, role, avatarUrl, lastLoginAt, lastLoginIp, userAgent, createdAt);
        }
    }
}
