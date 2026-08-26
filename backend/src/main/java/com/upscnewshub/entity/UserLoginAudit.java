package com.upscnewshub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_login_audits")
public class UserLoginAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 150)
    private String userName;

    @Column(nullable = false, length = 150)
    private String userEmail;

    @Column(nullable = false, length = 50)
    private String userRole;

    @Column(length = 100)
    private String ipAddress;

    @Column(length = 500)
    private String userAgent;

    @Column(length = 50)
    private String deviceType;

    @Column(length = 50)
    private String status = "SUCCESS";

    @Column(nullable = false)
    private LocalDateTime loginTimestamp = LocalDateTime.now();

    public UserLoginAudit() {}

    public UserLoginAudit(UUID userId, String userName, String userEmail, String userRole, String ipAddress, String userAgent) {
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userRole = userRole;
        this.ipAddress = ipAddress != null ? ipAddress : "127.0.0.1";
        this.userAgent = userAgent != null ? userAgent : "Web Browser";
        this.deviceType = parseDeviceType(userAgent);
        this.loginTimestamp = LocalDateTime.now();
        this.status = "SUCCESS";
    }

    private String parseDeviceType(String ua) {
        if (ua == null) return "Desktop";
        String lower = ua.toLowerCase();
        if (lower.contains("iphone")) return "iPhone iOS";
        if (lower.contains("ipad")) return "iPad iOS";
        if (lower.contains("android")) return "Android Mobile";
        if (lower.contains("macintosh") || lower.contains("mac os")) return "macOS Desktop";
        if (lower.contains("windows")) return "Windows Desktop";
        if (lower.contains("linux")) return "Linux Desktop";
        return "Web Client";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public String getDeviceType() { return deviceType; }
    public void setDeviceType(String deviceType) { this.deviceType = deviceType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getLoginTimestamp() { return loginTimestamp; }
    public void setLoginTimestamp(LocalDateTime loginTimestamp) { this.loginTimestamp = loginTimestamp; }
}
