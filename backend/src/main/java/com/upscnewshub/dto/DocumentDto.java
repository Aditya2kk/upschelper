package com.upscnewshub.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class DocumentDto {
    private UUID id;
    private String filename;
    private String originalName;
    private String fileType;
    private String processingStatus;
    private Integer pageCount;
    private Long fileSize;
    private LocalDateTime createdAt;

    public DocumentDto() {}

    public DocumentDto(UUID id, String filename, String originalName, String fileType, String processingStatus, Integer pageCount, Long fileSize, LocalDateTime createdAt) {
        this.id = id;
        this.filename = filename;
        this.originalName = originalName;
        this.fileType = fileType;
        this.processingStatus = processingStatus;
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

    public String getProcessingStatus() { return processingStatus; }
    public void setProcessingStatus(String processingStatus) { this.processingStatus = processingStatus; }

    public Integer getPageCount() { return pageCount; }
    public void setPageCount(Integer pageCount) { this.pageCount = pageCount; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
