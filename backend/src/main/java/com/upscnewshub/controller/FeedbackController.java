package com.upscnewshub.controller;

import com.upscnewshub.dto.ApiResponse;
import com.upscnewshub.entity.Feedback;
import com.upscnewshub.repository.FeedbackRepository;
import com.upscnewshub.security.CustomUserDetails;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;

    public FeedbackController(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    public static class CreateFeedbackRequest {
        private String type = "BUG";
        private String severity = "MEDIUM";

        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description is required")
        private String description;

        private String userName;
        private String userEmail;
        private String browserInfo;
        private String pageUrl;

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public String getBrowserInfo() { return browserInfo; }
        public void setBrowserInfo(String browserInfo) { this.browserInfo = browserInfo; }
        public String getPageUrl() { return pageUrl; }
        public void setPageUrl(String pageUrl) { this.pageUrl = pageUrl; }
    }

    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<Feedback>> submitFeedback(
            @Valid @RequestBody CreateFeedbackRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        String userName = request.getUserName();
        String userEmail = request.getUserEmail();

        if (userDetails != null) {
            if (userName == null || userName.trim().isEmpty()) {
                userName = userDetails.getName();
            }
            if (userEmail == null || userEmail.trim().isEmpty()) {
                userEmail = userDetails.getEmail();
            }
        }

        Feedback feedback = Feedback.builder()
                .type(request.getType() != null ? request.getType().toUpperCase() : "BUG")
                .severity(request.getSeverity() != null ? request.getSeverity().toUpperCase() : "MEDIUM")
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .userName(userName != null ? userName.trim() : "Anonymous Aspirant")
                .userEmail(userEmail != null ? userEmail.trim() : "unspecified@user.com")
                .browserInfo(request.getBrowserInfo())
                .pageUrl(request.getPageUrl())
                .status("OPEN")
                .build();

        Feedback saved = feedbackRepository.save(feedback);
        return ResponseEntity.ok(ApiResponse.success("Thank you for your feedback! Our team has received your report.", saved));
    }

    @GetMapping("/admin/feedback")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Feedback>>> getAdminFeedbackList(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null || !"ADMIN".equalsIgnoreCase(userDetails.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied. Only Administrators can review user feedback.", "FORBIDDEN", "/api/admin/feedback"));
        }

        List<Feedback> list = feedbackRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.success("Feedback retrieved successfully", list));
    }

    @PatchMapping("/admin/feedback/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Feedback>> updateFeedbackStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null || !"ADMIN".equalsIgnoreCase(userDetails.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied.", "FORBIDDEN", "/api/admin/feedback"));
        }

        String newStatus = body.get("status");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            newStatus = "RESOLVED";
        }

        Feedback feedback = feedbackRepository.findById(id)
                .orElse(null);

        if (feedback == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Feedback item not found.", "NOT_FOUND", "/api/admin/feedback"));
        }

        feedback.setStatus(newStatus.toUpperCase());
        Feedback updated = feedbackRepository.save(feedback);
        return ResponseEntity.ok(ApiResponse.success("Status updated to " + feedback.getStatus(), updated));
    }
}
