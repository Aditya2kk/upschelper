package com.upscnewshub.service;

import com.upscnewshub.dto.DocumentDto;
import com.upscnewshub.entity.Document;
import com.upscnewshub.entity.User;
import com.upscnewshub.exception.BadRequestException;
import com.upscnewshub.exception.ResourceNotFoundException;
import com.upscnewshub.repository.DocumentRepository;
import com.upscnewshub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DocumentProcessorService documentProcessorService;

    @Value("${app.storage.local-path:./uploads}")
    private String storageBasePath;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

    public DocumentService(DocumentRepository documentRepository,
                           UserRepository userRepository,
                           DocumentProcessorService documentProcessorService) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.documentProcessorService = documentProcessorService;
    }

    /**
     * Upload a document: saves file to disk, creates DB record with PROCESSING status,
     * and returns immediately (~1 second). Actual PDF processing happens asynchronously
     * in DocumentProcessorService.
     */
    public DocumentDto uploadAndProcessDocument(MultipartFile file, UUID userId) {
        // 1. Validation
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a valid file to upload.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Please upload a valid PDF document (.pdf).");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds maximum limit of 50 MB.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 2. Prepare storage path
        String safeName = sanitizeFilename(originalFilename);
        String docIdStr = UUID.randomUUID().toString();
        Path userDir = Paths.get(storageBasePath, "documents", userId.toString()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(userDir);
        } catch (IOException e) {
            throw new BadRequestException("Could not initialize document storage location.");
        }

        Path targetPath = userDir.resolve(docIdStr + "_" + safeName);

        try {
            Files.copy(file.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to save uploaded file to {}", targetPath, e);
            throw new BadRequestException("Could not save uploaded document to server.");
        }

        // 3. Create Document entity in PROCESSING status and return immediately
        Document document = Document.builder()
                .filename(safeName)
                .originalName(originalFilename)
                .fileType("PDF")
                .source("UPLOAD")
                .uploadedBy(user)
                .fileSize(file.getSize())
                .processingStatus("PROCESSING")
                .build();

        document = documentRepository.save(document);
        log.info("Document '{}' saved with PROCESSING status. Starting async processing...", safeName);

        // 4. Kick off async background processing (called on a DIFFERENT bean so @Async works)
        documentProcessorService.processDocumentAsync(document.getId(), targetPath.toString());

        return mapToDto(document);
    }

    private String sanitizeFilename(String filename) {
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> getUserDocuments(UUID userId) {
        return documentRepository.findByUploadedByIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DocumentDto getDocumentById(UUID docId, UUID userId) {
        Document doc = documentRepository.findByIdAndUploadedById(docId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        return mapToDto(doc);
    }

    @Transactional
    public void deleteDocument(UUID docId, UUID userId) {
        Document doc = documentRepository.findByIdAndUploadedById(docId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        documentRepository.delete(doc);
    }

    private DocumentDto mapToDto(Document document) {
        return new DocumentDto(
                document.getId(),
                document.getFilename(),
                document.getOriginalName(),
                document.getFileType(),
                document.getProcessingStatus(),
                document.getPageCount(),
                document.getFileSize(),
                document.getCreatedAt()
        );
    }
}
