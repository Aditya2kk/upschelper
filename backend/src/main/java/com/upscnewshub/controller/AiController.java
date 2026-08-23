package com.upscnewshub.controller;

import com.upscnewshub.dto.ApiResponse;
import com.upscnewshub.dto.DocumentQueryRequest;
import com.upscnewshub.dto.DocumentQueryResponse;
import com.upscnewshub.security.CustomUserDetails;
import com.upscnewshub.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/document-query")
    public ResponseEntity<ApiResponse<DocumentQueryResponse>> queryDocument(
            @Valid @RequestBody DocumentQueryRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DocumentQueryResponse response = aiService.queryDocument(request, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
