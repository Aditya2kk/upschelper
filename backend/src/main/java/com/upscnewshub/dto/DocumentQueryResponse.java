package com.upscnewshub.dto;

import java.util.List;
import java.util.UUID;

public class DocumentQueryResponse {

    private UUID documentId;
    private String documentName;
    private String query;
    private String answer;
    private String upscRelevance;
    private List<SourceCitation> sources;
    private List<String> prelimsFacts;
    private List<String> mainsPoints;
    private String timestamp;

    public static class SourceCitation {
        private String title;
        private Integer pageNumber;
        private String excerpt;

        public SourceCitation() {}

        public SourceCitation(String title, Integer pageNumber, String excerpt) {
            this.title = title;
            this.pageNumber = pageNumber;
            this.excerpt = excerpt;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public Integer getPageNumber() { return pageNumber; }
        public void setPageNumber(Integer pageNumber) { this.pageNumber = pageNumber; }

        public String getExcerpt() { return excerpt; }
        public void setExcerpt(String excerpt) { this.excerpt = excerpt; }
    }

    public DocumentQueryResponse() {}

    public UUID getDocumentId() { return documentId; }
    public void setDocumentId(UUID documentId) { this.documentId = documentId; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public String getUpscRelevance() { return upscRelevance; }
    public void setUpscRelevance(String upscRelevance) { this.upscRelevance = upscRelevance; }

    public List<SourceCitation> getSources() { return sources; }
    public void setSources(List<SourceCitation> sources) { this.sources = sources; }

    public List<String> getPrelimsFacts() { return prelimsFacts; }
    public void setPrelimsFacts(List<String> prelimsFacts) { this.prelimsFacts = prelimsFacts; }

    public List<String> getMainsPoints() { return mainsPoints; }
    public void setMainsPoints(List<String> mainsPoints) { this.mainsPoints = mainsPoints; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
