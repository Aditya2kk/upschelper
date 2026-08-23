package com.upscnewshub.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String filename;

    @Column(name = "original_name", nullable = false)
    private String originalName;

    @Column(name = "file_type", nullable = false, length = 20)
    private String fileType = "PDF";

    @Column(length = 50)
    private String source = "UPLOAD";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Column(name = "extracted_text", columnDefinition = "TEXT")
    private String extractedText;

    @Column(name = "processing_status", nullable = false, length = 20)
    private String processingStatus = "PENDING"; // PENDING, PROCESSING, READY, FAILED

    @Column(name = "page_count")
    private Integer pageCount = 0;

    @Column(name = "file_size")
    private Long fileSize = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DocumentChunk> chunks = new ArrayList<>();

    public Document() {}

    public Document(UUID id, String filename, String originalName, String fileType, String source, User uploadedBy, String extractedText, String processingStatus, Integer pageCount, Long fileSize, LocalDateTime createdAt) {
        this.id = id;
        this.filename = filename;
        this.originalName = originalName;
        this.fileType = fileType != null ? fileType : "PDF";
        this.source = source != null ? source : "UPLOAD";
        this.uploadedBy = uploadedBy;
        this.extractedText = extractedText;
        this.processingStatus = processingStatus != null ? processingStatus : "PENDING";
        this.pageCount = pageCount;
        this.fileSize = fileSize;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public String getOriginalName() { return originalName; }
    public void setOriginalName(String originalName) { this.originalName = originalName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public User getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }

    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }

    public String getProcessingStatus() { return processingStatus; }
    public void setProcessingStatus(String processingStatus) { this.processingStatus = processingStatus; }

    public Integer getPageCount() { return pageCount; }
    public void setPageCount(Integer pageCount) { this.pageCount = pageCount; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<DocumentChunk> getChunks() { return chunks; }
    public void setChunks(List<DocumentChunk> chunks) { this.chunks = chunks; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String filename;
        private String originalName;
        private String fileType = "PDF";
        private String source = "UPLOAD";
        private User uploadedBy;
        private String extractedText;
        private String processingStatus = "PENDING";
        private Integer pageCount = 0;
        private Long fileSize = 0L;
        private LocalDateTime createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder filename(String filename) { this.filename = filename; return this; }
        public Builder originalName(String originalName) { this.originalName = originalName; return this; }
        public Builder fileType(String fileType) { this.fileType = fileType; return this; }
        public Builder source(String source) { this.source = source; return this; }
        public Builder uploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; return this; }
        public Builder extractedText(String extractedText) { this.extractedText = extractedText; return this; }
        public Builder processingStatus(String processingStatus) { this.processingStatus = processingStatus; return this; }
        public Builder pageCount(Integer pageCount) { this.pageCount = pageCount; return this; }
        public Builder fileSize(Long fileSize) { this.fileSize = fileSize; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Document build() {
            return new Document(id, filename, originalName, fileType, source, uploadedBy, extractedText, processingStatus, pageCount, fileSize, createdAt);
        }
    }
}
