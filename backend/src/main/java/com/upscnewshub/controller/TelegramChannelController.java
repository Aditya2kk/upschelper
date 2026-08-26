package com.upscnewshub.controller;

import com.upscnewshub.dto.ApiResponse;
import com.upscnewshub.entity.TelegramChannelSource;
import com.upscnewshub.repository.TelegramChannelRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/channels")
public class TelegramChannelController {

    private final TelegramChannelRepository repository;

    public TelegramChannelController(TelegramChannelRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TelegramChannelSource>>> getAllChannels() {
        List<TelegramChannelSource> list = repository.findAll();
        // If empty, initialize with default channel
        if (list.isEmpty()) {
            TelegramChannelSource defaultCh = new TelegramChannelSource(
                "National Daily Newspaper PDF Feed",
                "https://t.me/national_epapers",
                "national_epapers",
                "The Hindu, Indian Express, National Press"
            );
            repository.save(defaultCh);
            list = repository.findAll();
        }
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TelegramChannelSource>> addChannel(@RequestBody Map<String, Object> body) {
        String name = (String) body.getOrDefault("name", "New Telegram Newspaper Channel");
        String channelUrl = (String) body.getOrDefault("channelUrl", "");
        String focus = (String) body.getOrDefault("newspaperFocus", "All Daily Newspapers");
        
        if (channelUrl == null || channelUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Channel URL or handle is required"));
        }

        String username = channelUrl
                .replace("https://t.me/", "")
                .replace("http://t.me/", "")
                .replace("@", "")
                .replace("/", "")
                .trim();

        if (repository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Channel @" + username + " is already configured."));
        }

        TelegramChannelSource source = new TelegramChannelSource(name, "https://t.me/" + username, username, focus);
        source.setPollIntervalMinutes(body.get("pollIntervalMinutes") != null ? ((Number) body.get("pollIntervalMinutes")).intValue() : 20);
        TelegramChannelSource saved = repository.save(source);

        return ResponseEntity.ok(ApiResponse.success("Channel added successfully with Smart Deduplication", saved));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<TelegramChannelSource>> toggleChannel(@PathVariable Long id) {
        return repository.findById(id).map(ch -> {
            ch.setActive(!ch.getActive());
            TelegramChannelSource updated = repository.save(ch);
            return ResponseEntity.ok(ApiResponse.success("Channel status updated", updated));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteChannel(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success("Channel removed from ingestion pipeline", null));
        }
        return ResponseEntity.notFound().build();
    }
}
