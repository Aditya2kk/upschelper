package com.upscnewshub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "telegram_channel_sources")
public class TelegramChannelSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 300)
    private String channelUrl;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Integer pollIntervalMinutes = 20;

    @Column(length = 200)
    private String newspaperFocus;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime lastFetchedAt;

    public TelegramChannelSource() {}

    public TelegramChannelSource(String name, String channelUrl, String username, String newspaperFocus) {
        this.name = name;
        this.channelUrl = channelUrl;
        this.username = username;
        this.newspaperFocus = newspaperFocus;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getChannelUrl() { return channelUrl; }
    public void setChannelUrl(String channelUrl) { this.channelUrl = channelUrl; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Integer getPollIntervalMinutes() { return pollIntervalMinutes; }
    public void setPollIntervalMinutes(Integer pollIntervalMinutes) { this.pollIntervalMinutes = pollIntervalMinutes; }

    public String getNewspaperFocus() { return newspaperFocus; }
    public void setNewspaperFocus(String newspaperFocus) { this.newspaperFocus = newspaperFocus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastFetchedAt() { return lastFetchedAt; }
    public void setLastFetchedAt(LocalDateTime lastFetchedAt) { this.lastFetchedAt = lastFetchedAt; }
}
