package com.simback.perfume.controller.admin;

import com.simback.perfume.payload.requests.NotificationCreateRequest;
import com.simback.perfume.payload.responses.NotificationResponse;
import com.simback.perfume.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
public class NotificationAdminController {
    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationResponse> create(@Valid @RequestBody NotificationCreateRequest request) {
        return ResponseEntity.ok(notificationService.create(request));
    }

    @PostMapping("/broadcast")
    public ResponseEntity<Void> broadcast(@Valid @RequestBody NotificationCreateRequest request) {
        notificationService.broadcast(request.getTitle(), request.getMessage(), request.getActionUrl(),
                request.getImageUrl(), request.getType().name());
        return ResponseEntity.ok().build();
    }
}
