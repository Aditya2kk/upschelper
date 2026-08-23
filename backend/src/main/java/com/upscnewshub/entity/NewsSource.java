package com.upscnewshub.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "news_sources")
public class NewsSource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "source_type", nullable = false, length = 20)
    private String sourceType;

    @Column(name = "base_url", length = 500)
    private String baseUrl;

    @Column(name = "rss_url", length = 500)
    private String rssUrl;

    @Column(name = "api_url", length = 500)
    private String apiUrl;

    @Column(name = "telegram_channel_id", length = 100)
    private String telegramChannelId;

    @Column(name = "telegram_channel_url", length = 500)
    private String telegramChannelUrl;

    @Column(name = "authorized_distribution", nullable = false)
    private Boolean authorizedDistribution = false;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "poll_interval_minutes", nullable = false)
    private Integer pollIntervalMinutes = 60;

    @Column(name = "last_fetched_at")
    private LocalDateTime lastFetchedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public NewsSource() {}

    public NewsSource(UUID id, String name, String sourceType, String baseUrl, String rssUrl, String apiUrl, String telegramChannelId, String telegramChannelUrl, Boolean authorizedDistribution, Boolean active, Integer pollIntervalMinutes, LocalDateTime lastFetchedAt, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.sourceType = sourceType;
        this.baseUrl = baseUrl;
        this.rssUrl = rssUrl;
        this.apiUrl = apiUrl;
        this.telegramChannelId = telegramChannelId;
        this.telegramChannelUrl = telegramChannelUrl;
        this.authorizedDistribution = authorizedDistribution != null ? authorizedDistribution : false;
        this.active = active != null ? active : true;
        this.pollIntervalMinutes = pollIntervalMinutes != null ? pollIntervalMinutes : 60;
        this.lastFetchedAt = lastFetchedAt;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public String getRssUrl() { return rssUrl; }
    public void setRssUrl(String rssUrl) { this.rssUrl = rssUrl; }

    public String getApiUrl() { return apiUrl; }
    public void setApiUrl(String apiUrl) { this.apiUrl = apiUrl; }

    public String getTelegramChannelId() { return telegramChannelId; }
    public void setTelegramChannelId(String telegramChannelId) { this.telegramChannelId = telegramChannelId; }

    public String getTelegramChannelUrl() { return telegramChannelUrl; }
    public void setTelegramChannelUrl(String telegramChannelUrl) { this.telegramChannelUrl = telegramChannelUrl; }

    public Boolean getAuthorizedDistribution() { return authorizedDistribution; }
    public void setAuthorizedDistribution(Boolean authorizedDistribution) { this.authorizedDistribution = authorizedDistribution; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Integer getPollIntervalMinutes() { return pollIntervalMinutes; }
    public void setPollIntervalMinutes(Integer pollIntervalMinutes) { this.pollIntervalMinutes = pollIntervalMinutes; }

    public LocalDateTime getLastFetchedAt() { return lastFetchedAt; }
    public void setLastFetchedAt(LocalDateTime lastFetchedAt) { this.lastFetchedAt = lastFetchedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String name;
        private String sourceType;
        private String baseUrl;
        private String rssUrl;
        private String apiUrl;
        private String telegramChannelId;
        private String telegramChannelUrl;
        private Boolean authorizedDistribution = false;
        private Boolean active = true;
        private Integer pollIntervalMinutes = 60;
        private LocalDateTime lastFetchedAt;
        private LocalDateTime createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder sourceType(String sourceType) { this.sourceType = sourceType; return this; }
        public Builder baseUrl(String baseUrl) { this.baseUrl = baseUrl; return this; }
        public Builder rssUrl(String rssUrl) { this.rssUrl = rssUrl; return this; }
        public Builder apiUrl(String apiUrl) { this.apiUrl = apiUrl; return this; }
        public Builder telegramChannelId(String telegramChannelId) { this.telegramChannelId = telegramChannelId; return this; }
        public Builder telegramChannelUrl(String telegramChannelUrl) { this.telegramChannelUrl = telegramChannelUrl; return this; }
        public Builder authorizedDistribution(Boolean authorizedDistribution) { this.authorizedDistribution = authorizedDistribution; return this; }
        public Builder active(Boolean active) { this.active = active; return this; }
        public Builder pollIntervalMinutes(Integer pollIntervalMinutes) { this.pollIntervalMinutes = pollIntervalMinutes; return this; }
        public Builder lastFetchedAt(LocalDateTime lastFetchedAt) { this.lastFetchedAt = lastFetchedAt; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public NewsSource build() {
            return new NewsSource(id, name, sourceType, baseUrl, rssUrl, apiUrl, telegramChannelId, telegramChannelUrl, authorizedDistribution, active, pollIntervalMinutes, lastFetchedAt, createdAt);
        }
    }
}
