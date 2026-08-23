package com.upscnewshub.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class DocumentQueryRequest {

    @NotNull(message = "Document ID is required")
    private UUID documentId;

    private String query;

    // Action types: "QUERY", "UPSC_TOPICS", "SUMMARIZE", "MCQS", "MAINS_ANSWER"
    private String action = "QUERY";

    public DocumentQueryRequest() {}

    public DocumentQueryRequest(UUID documentId, String query, String action) {
        this.documentId = documentId;
        this.query = query;
        this.action = action != null ? action : "QUERY";
    }

    public UUID getDocumentId() { return documentId; }
    public void setDocumentId(UUID documentId) { this.documentId = documentId; }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
}
