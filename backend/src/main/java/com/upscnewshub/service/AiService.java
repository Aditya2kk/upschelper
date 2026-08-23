package com.upscnewshub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.upscnewshub.dto.DocumentQueryRequest;
import com.upscnewshub.dto.DocumentQueryResponse;
import com.upscnewshub.entity.Document;
import com.upscnewshub.entity.DocumentChunk;
import com.upscnewshub.exception.BadRequestException;
import com.upscnewshub.exception.ResourceNotFoundException;
import com.upscnewshub.repository.DocumentChunkRepository;
import com.upscnewshub.repository.DocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository documentChunkRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.gemini.api-key:${GEMINI_API_KEY:}}")
    private String geminiApiKey;

    private static final int TOP_K_CHUNKS = 5;

    // Strict list of query-noise stopwords that must never match chunks
    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "but", "is", "are",
            "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
            "with", "by", "from", "up", "about", "into", "over", "after", "news", "newspaper",
            "paper", "today", "that", "this", "these", "those", "what", "which", "who", "whom",
            "whose", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other",
            "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too",
            "very", "can", "will", "just", "should", "now", "tell", "give", "show", "find",
            "extract", "important", "specific", "type", "summarize", "summary", "page", "epaper", "express",
            "hindu", "article", "report", "edition", "delhi", "daily", "material", "brief",
            "related", "relating", "relation", "relations", "regarding", "based", "discussed",
            "mentioned", "details", "coverage", "developments", "matters", "issues", "aspects",
            "points", "content", "information", "story", "stories", "section", "sections", "item", "items"
    );

    // Precise domain synonyms (whole-word and multi-word phrases only, no loose 3-letter substrings)
    private static final Map<String, List<String>> DOMAIN_SYNONYMS = Map.of(
            "defence", List.of("defence", "defense", "military", "army", "navy", "airforce", "armed forces", "drdo", "missile", "missiles", "weapon", "weapons", "warfare", "artillery", "battalion", "regiment", "rajnath singh", "gorkha rifles", "ins", "corvette", "frigate", "fighter jet", "sukhoi", "rafale", "tejas", "brahmos", "agniveer", "tri-service", "security forces", "border security"),
            "defense", List.of("defence", "defense", "military", "army", "navy", "airforce", "armed forces", "drdo", "missile", "missiles", "weapon", "weapons", "warfare", "artillery", "battalion", "regiment", "rajnath singh", "gorkha rifles", "ins", "corvette", "frigate", "fighter jet", "sukhoi", "rafale", "tejas", "brahmos", "agniveer", "tri-service", "security forces", "border security"),
            "military", List.of("defence", "defense", "military", "army", "navy", "airforce", "armed forces", "drdo", "missile", "weapons", "warfare", "artillery", "battalion", "regiment", "security forces"),
            "geopolitics", List.of("geopolitics", "foreign policy", "diplomacy", "bilateral", "multilateral", "summit", "treaty", "unsc", "g20", "brics", "quad", "china", "russia", "pakistan", "middle east", "israel", "iran", "embassy", "ambassador"),
            "economy", List.of("economy", "gdp", "rbi", "inflation", "repo rate", "fiscal deficit", "gst", "tax revenue", "trade deficit", "export", "import", "banking", "sebi", "union budget", "rupee", "forex", "fdi"),
            "polity", List.of("polity", "parliament", "supreme court", "high court", "constitution", "constitutional article", "governor", "election commission", "cabinet", "judiciary", "ordinance", "lok sabha", "rajya sabha", "chief justice"),
            "environment", List.of("environment", "climate change", "carbon emissions", "cop", "biodiversity", "wildlife sanctuary", "pollution", "renewable energy", "solar", "wetland", "forest conservation", "air quality"),
            "science", List.of("science", "technology", "isro", "satellite", "space mission", "artificial intelligence", "quantum computing", "biotechnology", "semiconductor", "cybersecurity", "nuclear")
    );

    public AiService(DocumentRepository documentRepository,
                     DocumentChunkRepository documentChunkRepository) {
        this.documentRepository = documentRepository;
        this.documentChunkRepository = documentChunkRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Transactional(readOnly = true)
    public DocumentQueryResponse queryDocument(DocumentQueryRequest request, UUID userId) {
        UUID docId = request.getDocumentId();
        Document document = documentRepository.findByIdAndUploadedById(docId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found or you do not have permission to access it."));

        if (!"READY".equalsIgnoreCase(document.getProcessingStatus())) {
            throw new BadRequestException("Document is still processing. Please wait until it is ready.");
        }

        List<DocumentChunk> allChunks = documentChunkRepository.findAllChunksByDocId(docId);
        if (allChunks.isEmpty()) {
            throw new BadRequestException("No readable text chunks found for this document.");
        }

        String action = request.getAction() != null ? request.getAction().toUpperCase() : "QUERY";
        String userQuery = request.getQuery() != null ? request.getQuery().trim() : "";

        // Formulate target query based on action
        String searchTarget = userQuery;
        boolean isGeneralAction = false;
        if (searchTarget.isEmpty()) {
            isGeneralAction = true;
            switch (action) {
                case "UPSC_TOPICS" -> searchTarget = "government schemes policy national international economy environment polity judiciary";
                case "SUMMARIZE" -> searchTarget = "headline summary editorial development cabinet decision supreme court agreement";
                case "MCQS" -> searchTarget = "committee act scheme constitutional article index report treaty launch";
                case "MAINS_ANSWER" -> searchTarget = "critical analysis challenges way forward government initiatives policy impact reforms";
                default -> searchTarget = "important current affairs news";
            }
        }

        // 1. Retrieve relevant chunks with high-precision whole-word & domain filtering
        Set<String> searchKeywords = extractSearchKeywords(searchTarget);
        List<ScoredChunk> scoredChunks = scoreAndRankChunks(allChunks, searchKeywords, isGeneralAction);

        // Filter strictly to chunks with positive relevance (score > 0)
        List<DocumentChunk> relevantChunks = scoredChunks.stream()
                .filter(sc -> sc.score > 0)
                .limit(TOP_K_CHUNKS)
                .map(sc -> sc.chunk)
                .collect(Collectors.toList());

        // 2. Build Context String & Verified Page Citations
        StringBuilder contextBuilder = new StringBuilder();
        List<DocumentQueryResponse.SourceCitation> citations = new ArrayList<>();
        Set<Integer> citedPages = new LinkedHashSet<>();

        for (DocumentChunk chunk : relevantChunks) {
            contextBuilder.append(String.format("[PAGE %d, Chunk #%d]\n%s\n\n",
                    chunk.getPageNumber(), chunk.getChunkIndex() + 1, chunk.getContent()));

            if (citedPages.add(chunk.getPageNumber())) {
                String excerpt = extractMatchingExcerpt(chunk.getContent(), searchKeywords);
                citations.add(new DocumentQueryResponse.SourceCitation(
                        document.getOriginalName() + " - Page " + chunk.getPageNumber(),
                        chunk.getPageNumber(),
                        excerpt
                ));
            }
        }

        String contextText = contextBuilder.toString();

        // 3. Generate Answer
        DocumentQueryResponse response = new DocumentQueryResponse();
        response.setDocumentId(document.getId());
        response.setDocumentName(document.getOriginalName());
        response.setQuery(userQuery.isEmpty() ? getActionTitle(action) : userQuery);
        response.setSources(citations);
        response.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a, dd MMM yyyy")));

        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty() && !relevantChunks.isEmpty()) {
            try {
                generateAnswerWithGemini(userQuery, action, contextText, document.getOriginalName(), response);
                return response;
            } catch (Exception ex) {
                log.warn("Gemini API call failed, falling back to local grounded synthesis: {}", ex.getMessage());
            }
        }

        // High-precision Local Grounded Synthesis
        generateAnswerLocalGrounded(userQuery, action, relevantChunks, allChunks, searchKeywords, document.getOriginalName(), response);
        return response;
    }

    private void generateAnswerWithGemini(String userQuery, String action, String contextText, String docName, DocumentQueryResponse response) {
        String systemPrompt = """
                You are UPSC NewsHub AI, an expert UPSC CSE research assistant.
                You are analyzing an uploaded newspaper/document: "%s".
                
                CRITICAL INSTRUCTIONS:
                1. Answer ONLY using facts present in the provided DOCUMENT CONTEXT.
                2. Do NOT invent facts or hallucinate outside information.
                3. If the user asks for a specific topic (e.g. Defence, Economy) and it is NOT mentioned in the context, explicitly say: "No specific reports on [topic] were found in this uploaded newspaper/document."
                4. Structure your response with clean Markdown:
                   - ## Key Developments (Direct, clear bullet points)
                   - ## UPSC Relevance (GS Paper I/II/III/IV syllabus significance)
                   - ## Page Sources (Cite exact page numbers like Page 4, Page 12)
                """.formatted(docName);

        String userPrompt = buildPromptByAction(action, userQuery, contextText);
        String geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey.trim();

        Map<String, Object> payload = Map.of(
                "contents", List.of(
                        Map.of("role", "user", "parts", List.of(
                                Map.of("text", systemPrompt + "\n\n" + userPrompt)
                        ))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.1,
                        "maxOutputTokens", 1500
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
        ResponseEntity<String> apiResponse = restTemplate.exchange(geminiUrl, HttpMethod.POST, requestEntity, String.class);

        if (apiResponse.getStatusCode().is2xxSuccessful() && apiResponse.getBody() != null) {
            try {
                JsonNode root = objectMapper.readTree(apiResponse.getBody());
                JsonNode candidate = root.path("candidates").get(0);
                String generatedText = candidate.path("content").path("parts").get(0).path("text").asText();

                response.setAnswer(generatedText);
                response.setUpscRelevance("GS Contextual Analysis");
                return;
            } catch (Exception e) {
                log.error("Failed to parse Gemini response", e);
            }
        }

        throw new RuntimeException("Empty or invalid Gemini response");
    }

    private void generateAnswerLocalGrounded(String userQuery, String action, List<DocumentChunk> relevantChunks, List<DocumentChunk> allChunks, Set<String> searchKeywords, String docName, DocumentQueryResponse response) {
        StringBuilder answerBuilder = new StringBuilder();

        // Check if no matching chunks were found for a specific query
        if (relevantChunks.isEmpty()) {
            answerBuilder.append("## No Specific Information Found for \"").append(userQuery.isEmpty() ? "Topic" : userQuery).append("\"\n\n");
            answerBuilder.append("The uploaded newspaper/document **").append(docName).append("** does not contain specific articles or reports matching this topic.\n\n");
            answerBuilder.append("### Key Topics Covered in this Document:\n");

            int count = 1;
            Set<Integer> sampledPages = new HashSet<>();
            for (DocumentChunk chunk : allChunks) {
                if (count > 4) break;
                if (!sampledPages.contains(chunk.getPageNumber())) {
                    String sentence = getFirstMeaningfulSentence(chunk.getContent());
                    if (sentence.length() > 25) {
                        answerBuilder.append(count++).append(". **").append(sentence).append("** (Page ").append(chunk.getPageNumber()).append(")\n");
                        sampledPages.add(chunk.getPageNumber());
                    }
                }
            }
            response.setAnswer(answerBuilder.toString());
            response.setUpscRelevance("Topic Not Reported in this Edition");
            return;
        }

        switch (action) {
            case "UPSC_TOPICS" -> {
                answerBuilder.append("## High-Yield UPSC Topics Identified in ").append(docName).append("\n\n");
                int item = 1;
                for (DocumentChunk c : relevantChunks) {
                    String snippet = extractMatchingExcerpt(c.getContent(), searchKeywords);
                    if (!snippet.isEmpty()) {
                        answerBuilder.append(item++).append(". **").append(snippet).append("**\n");
                        answerBuilder.append("   - *Source: Page ").append(c.getPageNumber()).append("*\n\n");
                    }
                }
                response.setUpscRelevance("Syllabus: GS Paper II & Paper III Current Affairs");
            }
            case "SUMMARIZE" -> {
                answerBuilder.append("## Executive UPSC Summary: ").append(docName).append("\n\n");
                for (DocumentChunk c : relevantChunks) {
                    answerBuilder.append("### Highlight from Page ").append(c.getPageNumber()).append("\n");
                    answerBuilder.append(extractMatchingExcerpt(c.getContent(), searchKeywords)).append("\n\n");
                }
                response.setUpscRelevance("GS Daily Comprehensive Brief");
            }
            case "MCQS" -> {
                answerBuilder.append("## Practice UPSC Prelims MCQs Grounded in ").append(docName).append("\n\n");
                int qNum = 1;
                for (DocumentChunk c : relevantChunks) {
                    if (qNum > 5) break;
                    String sentence = extractMatchingExcerpt(c.getContent(), searchKeywords);
                    answerBuilder.append("### Question ").append(qNum).append("\n");
                    answerBuilder.append("With reference to developments reported on **Page ").append(c.getPageNumber()).append("**, consider the following statement:\n");
                    answerBuilder.append("> \"").append(sentence).append("\"\n\n");
                    answerBuilder.append("Which of the statements given above is/are correct?\n");
                    answerBuilder.append("A) 1 only\nB) 2 only\nC) Both 1 and 2\nD) Neither 1 nor 2\n\n");
                    answerBuilder.append("**Correct Answer:** A\n");
                    answerBuilder.append("**Explanation:** Grounded directly in reported text on Page ").append(c.getPageNumber()).append(".\n\n");
                    qNum++;
                }
                response.setUpscRelevance("Prelims High-Yield Practice");
            }
            case "MAINS_ANSWER" -> {
                answerBuilder.append("## UPSC Mains Model Structure (200 Words)\n\n");
                answerBuilder.append("### Question:\n");
                answerBuilder.append("*Critically analyze the key developments in ").append(docName).append(" with reference to governance and strategic priorities. (10 Marks, 200 Words)*\n\n");
                answerBuilder.append("### 1. Introduction\n");
                answerBuilder.append("Recent reports in ").append(docName).append(" highlight critical national priorities impacting institutional frameworks and policy execution.\n\n");
                answerBuilder.append("### 2. Core Arguments & Evidence\n");
                for (DocumentChunk c : relevantChunks.stream().limit(3).toList()) {
                    answerBuilder.append("- **Point (Page ").append(c.getPageNumber()).append("):** ")
                            .append(extractMatchingExcerpt(c.getContent(), searchKeywords)).append("\n");
                }
                answerBuilder.append("\n### 3. Way Forward\n");
                answerBuilder.append("- Enhancing institutional coordination and timely policy execution.\n");
                answerBuilder.append("- Fostering transparency and structured stakeholder reviews.\n");
                response.setUpscRelevance("GS-II & GS-III Mains Analytical Structure");
            }
            default -> {
                answerBuilder.append("## Grounded Evidence for \"").append(userQuery).append("\"\n\n");
                answerBuilder.append("Extracted directly from **").append(docName).append("**:\n\n");
                for (DocumentChunk c : relevantChunks) {
                    String matchedSnippet = extractMatchingExcerpt(c.getContent(), searchKeywords);
                    answerBuilder.append("### From Page ").append(c.getPageNumber()).append(":\n");
                    answerBuilder.append(matchedSnippet).append("\n\n");
                }
                response.setUpscRelevance("Direct Document Evidence");
            }
        }

        response.setAnswer(answerBuilder.toString());
    }

    private String buildPromptByAction(String action, String userQuery, String contextText) {
        return switch (action) {
            case "UPSC_TOPICS" -> """
                    DOCUMENT CONTEXT:
                    %s
                    
                    TASK: Identify the top 5 most important UPSC CSE topics from this document.
                    Categorize each by GS Paper (GS-I, GS-II, GS-III, GS-IV), explain significance in 2 lines, and cite exact Page numbers.
                    """.formatted(contextText);
            case "SUMMARIZE" -> """
                    DOCUMENT CONTEXT:
                    %s
                    
                    TASK: Summarize key developments in this document in a structured UPSC Daily Brief format with exact Page citations.
                    """.formatted(contextText);
            case "MCQS" -> """
                    DOCUMENT CONTEXT:
                    %s
                    
                    TASK: Generate 5 UPSC Prelims-style multiple choice questions based strictly on the document context with answers and explanations.
                    """.formatted(contextText);
            case "MAINS_ANSWER" -> """
                    DOCUMENT CONTEXT:
                    %s
                    
                    TASK: Write a high-scoring 200-word UPSC Mains answer based on: "%s". Include Introduction, Body with Page Citations, and Way Forward.
                    """.formatted(contextText, userQuery.isEmpty() ? "Analyze key developments" : userQuery);
            default -> """
                    DOCUMENT CONTEXT:
                    %s
                    
                    USER QUESTION:
                    %s
                    
                    TASK: Provide a precise, well-structured answer grounded ONLY in the above document context. Cite page numbers. If the topic is not mentioned in the context, state clearly that it is not present in the document.
                    """.formatted(contextText, userQuery);
        };
    }

    /**
     * Extracts search keywords after filtering all noise stopwords and adding domain synonyms.
     */
    private Set<String> extractSearchKeywords(String rawQuery) {
        String[] words = rawQuery.toLowerCase().split("[^a-zA-Z0-9]+");
        Set<String> coreKeywords = Arrays.stream(words)
                .filter(w -> w.length() > 2 && !STOP_WORDS.contains(w))
                .collect(Collectors.toSet());

        Set<String> expandedKeywords = new HashSet<>(coreKeywords);
        for (String kw : coreKeywords) {
            for (Map.Entry<String, List<String>> entry : DOMAIN_SYNONYMS.entrySet()) {
                if (entry.getKey().equalsIgnoreCase(kw) || kw.contains(entry.getKey())) {
                    expandedKeywords.addAll(entry.getValue());
                }
            }
        }
        return expandedKeywords;
    }

    /**
     * High-precision whole-word chunk ranking:
     * - Uses exact whole-word matching (no false positive substring matches like 'mod' in 'commodity')
     * - Requires at least one real topic match to get score > 0
     */
    private List<ScoredChunk> scoreAndRankChunks(List<DocumentChunk> chunks, Set<String> targetKeywords, boolean isGeneralAction) {
        if (chunks == null || chunks.isEmpty()) {
            return Collections.emptyList();
        }

        List<ScoredChunk> scoredList = new ArrayList<>();

        for (DocumentChunk chunk : chunks) {
            String contentLower = chunk.getContent().toLowerCase();
            String[] tokens = contentLower.split("[^a-zA-Z0-9]+");
            Set<String> wordSet = new HashSet<>(Arrays.asList(tokens));

            double score = 0.0;

            for (String kw : targetKeywords) {
                if (kw.contains(" ")) {
                    // Multi-word phrase matching with word boundaries
                    Pattern pattern = Pattern.compile("\\b" + Pattern.quote(kw) + "\\b");
                    if (pattern.matcher(contentLower).find()) {
                        score += 30.0;
                    }
                } else {
                    // Whole-word matching
                    if (wordSet.contains(kw)) {
                        score += 20.0;
                        // Count occurrences
                        long count = Arrays.stream(tokens).filter(t -> t.equals(kw)).count();
                        score += Math.min(count * 5.0, 25.0);
                    }
                }
            }

            // General action bonus (only when user clicked general action like SUMMARIZE with no specific query)
            if (isGeneralAction && chunk.getPageNumber() <= 3) {
                score += 1.0;
            }

            scoredList.add(new ScoredChunk(chunk, score));
        }

        // Sort descending by score
        scoredList.sort((a, b) -> Double.compare(b.score, a.score));
        return scoredList;
    }

    /**
     * Extracts the specific paragraph or sentence in the chunk that actually contains
     * the target search keywords, rather than just returning the top of the page.
     */
    private String extractMatchingExcerpt(String content, Set<String> targetKeywords) {
        if (content == null || content.isEmpty()) return "";
        String[] lines = content.split("\n+");

        for (String line : lines) {
            String lineLower = line.toLowerCase();
            String[] tokens = lineLower.split("[^a-zA-Z0-9]+");
            Set<String> lineWords = new HashSet<>(Arrays.asList(tokens));

            for (String kw : targetKeywords) {
                if (kw.contains(" ")) {
                    if (Pattern.compile("\\b" + Pattern.quote(kw) + "\\b").matcher(lineLower).find()) {
                        String clean = cleanSnippet(line);
                        if (clean.length() > 20) {
                            return clean.length() > 360 ? clean.substring(0, 360) + "..." : clean;
                        }
                    }
                } else {
                    if (lineWords.contains(kw)) {
                        String clean = cleanSnippet(line);
                        if (clean.length() > 20) {
                            return clean.length() > 360 ? clean.substring(0, 360) + "..." : clean;
                        }
                    }
                }
            }
        }

        // Fallback to first meaningful section
        return getFirstMeaningfulSentence(content);
    }

    private String cleanSnippet(String raw) {
        return raw.replaceAll("\uFFFD", "")
                .replaceAll("[\uE000-\uF8FF]", "")
                .replaceAll("[\\p{Cntrl}]", " ")
                .replaceAll(" +", " ")
                .trim();
    }

    private String getFirstMeaningfulSentence(String text) {
        if (text == null) return "";
        String[] sentences = text.split("(?<=[.!?])\\s+");
        for (String s : sentences) {
            String clean = cleanSnippet(s);
            long letterCount = clean.chars().filter(Character::isLetter).count();
            if (letterCount > 20 && !clean.toLowerCase().contains("epaper") && !clean.toLowerCase().contains("page")) {
                return clean.length() > 140 ? clean.substring(0, 140) + "..." : clean;
            }
        }
        String fallback = cleanSnippet(text);
        return fallback.length() > 120 ? fallback.substring(0, 120) + "..." : fallback;
    }

    private String getActionTitle(String action) {
        return switch (action) {
            case "UPSC_TOPICS" -> "Top UPSC Topics & Syllabus Analysis";
            case "SUMMARIZE" -> "Comprehensive Document Summary";
            case "MCQS" -> "5 Practice Prelims MCQs";
            case "MAINS_ANSWER" -> "200-Word UPSC Mains Model Answer";
            default -> "Document Inquiry";
        };
    }

    private static class ScoredChunk {
        DocumentChunk chunk;
        double score;
        ScoredChunk(DocumentChunk chunk, double score) {
            this.chunk = chunk;
            this.score = score;
        }
    }
}
