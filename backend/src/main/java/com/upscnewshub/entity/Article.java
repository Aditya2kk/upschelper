package com.upscnewshub.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "articles")
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "source_url", unique = true, length = 1000)
    private String sourceUrl;

    @Column(name = "source_name", length = 200)
    private String sourceName;

    @Column(name = "content_hash", length = 64)
    private String contentHash;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(length = 200)
    private String author;

    @Column(length = 20)
    private String importance = "NORMAL";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_id")
    private NewsSource source;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "article_categories",
        joinColumns = @JoinColumn(name = "article_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Article() {}

    public Article(UUID id, String title, String description, String content, String sourceUrl, String sourceName, String contentHash, LocalDateTime publishedAt, String imageUrl, String author, String importance, NewsSource source, Set<Category> categories, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.content = content;
        this.sourceUrl = sourceUrl;
        this.sourceName = sourceName;
        this.contentHash = contentHash;
        this.publishedAt = publishedAt;
        this.imageUrl = imageUrl;
        this.author = author;
        this.importance = importance != null ? importance : "NORMAL";
        this.source = source;
        this.categories = categories != null ? categories : new HashSet<>();
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getSourceName() { return sourceName; }
    public void setSourceName(String sourceName) { this.sourceName = sourceName; }

    public String getContentHash() { return contentHash; }
    public void setContentHash(String contentHash) { this.contentHash = contentHash; }

    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getImportance() { return importance; }
    public void setImportance(String importance) { this.importance = importance; }

    public NewsSource getSource() { return source; }
    public void setSource(NewsSource source) { this.source = source; }

    public Set<Category> getCategories() { return categories; }
    public void setCategories(Set<Category> categories) { this.categories = categories; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String title;
        private String description;
        private String content;
        private String sourceUrl;
        private String sourceName;
        private String contentHash;
        private LocalDateTime publishedAt;
        private String imageUrl;
        private String author;
        private String importance = "NORMAL";
        private NewsSource source;
        private Set<Category> categories = new HashSet<>();
        private LocalDateTime createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder content(String content) { this.content = content; return this; }
        public Builder sourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; return this; }
        public Builder sourceName(String sourceName) { this.sourceName = sourceName; return this; }
        public Builder contentHash(String contentHash) { this.contentHash = contentHash; return this; }
        public Builder publishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; return this; }
        public Builder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public Builder author(String author) { this.author = author; return this; }
        public Builder importance(String importance) { this.importance = importance; return this; }
        public Builder source(NewsSource source) { this.source = source; return this; }
        public Builder categories(Set<Category> categories) { this.categories = categories; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Article build() {
            return new Article(id, title, description, content, sourceUrl, sourceName, contentHash, publishedAt, imageUrl, author, importance, source, categories, createdAt);
        }
    }
}
