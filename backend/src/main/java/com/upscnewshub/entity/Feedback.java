package com.upscnewshub.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String type = "BUG"; // BUG, SUGGESTION, GENERAL

    @Column(length = 20)
    private String severity = "MEDIUM"; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "user_name", length = 100)
    private String userName;

    @Column(name = "user_email", length = 100)
    private String userEmail;

    @Column(name = "browser_info", length = 500)
    private String browserInfo;

    @Column(name = "page_url", length = 500)
    private String pageUrl;

    @Column(nullable = false, length = 30)
    private String status = "OPEN"; // OPEN, IN_REVIEW, RESOLVED

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Feedback() {}

    public Feedback(UUID id, String type, String severity, String title, String description, String userName, String userEmail, String browserInfo, String pageUrl, String status, LocalDateTime createdAt) {
        this.id = id;
        this.type = type != null ? type : "BUG";
        this.severity = severity != null ? severity : "MEDIUM";
        this.title = title;
        this.description = description;
        this.userName = userName;
        this.userEmail = userEmail;
        this.browserInfo = browserInfo;
        this.pageUrl = pageUrl;
        this.status = status != null ? status : "OPEN";
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getBrowserInfo() { return browserInfo; }
    public void setBrowserInfo(String browserInfo) { this.browserInfo = browserInfo; }

    public String getPageUrl() { return pageUrl; }
    public void setPageUrl(String pageUrl) { this.pageUrl = pageUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String type = "BUG";
        private String severity = "MEDIUM";
        private String title;
        private String description;
        private String userName;
        private String userEmail;
        private String browserInfo;
        private String pageUrl;
        private String status = "OPEN";
        private LocalDateTime createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder severity(String severity) { this.severity = severity; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder userName(String userName) { this.userName = userName; return this; }
        public Builder userEmail(String userEmail) { this.userEmail = userEmail; return this; }
        public Builder browserInfo(String browserInfo) { this.browserInfo = browserInfo; return this; }
        public Builder pageUrl(String pageUrl) { this.pageUrl = pageUrl; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Feedback build() {
            return new Feedback(id, type, severity, title, description, userName, userEmail, browserInfo, pageUrl, status, createdAt);
        }
    }
}
