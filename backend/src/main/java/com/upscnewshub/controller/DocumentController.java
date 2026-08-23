package com.upscnewshub.controller;

import com.upscnewshub.dto.ApiResponse;
import com.upscnewshub.dto.DocumentDto;
import com.upscnewshub.security.CustomUserDetails;
import com.upscnewshub.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<DocumentDto>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DocumentDto doc = documentService.uploadAndProcessDocument(file, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Document uploaded and indexed successfully", doc));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getUserDocuments(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<DocumentDto> docs = documentService.getUserDocuments(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(docs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentDto>> getDocument(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DocumentDto doc = documentService.getDocumentById(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(doc));
    }

    /**
     * Lightweight status polling endpoint for async upload processing.
     * Frontend calls this every 3s after upload to check when PROCESSING -> READY.
     */
    @GetMapping("/{id}/status")
    public ResponseEntity<ApiResponse<DocumentDto>> getDocumentStatus(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DocumentDto doc = documentService.getDocumentById(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(doc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        documentService.deleteDocument(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }
}
