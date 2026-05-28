package com.simback.perfume.controller;

import com.simback.perfume.payload.requests.NotificationCreateRequest;
import com.simback.perfume.payload.responses.NotificationResponse;
import com.simback.perfume.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(@RequestHeader(value = "X-Username", required = false) String username) {
        return ResponseEntity.ok(notificationService.getForCurrentUser(username));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnread(@RequestHeader(value = "X-Username", required = false) String username) {
        return ResponseEntity.ok(notificationService.getUnreadForCurrentUser(username));
    }

    @GetMapping("/count-unread")
    public ResponseEntity<Long> countUnread(@RequestHeader(value = "X-Username", required = false) String username) {
        return ResponseEntity.ok(notificationService.countUnreadForCurrentUser(username));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id,
                                                           @RequestHeader(value = "X-Username", required = false) String username) {
        return ResponseEntity.ok(notificationService.markAsRead(id, username));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@RequestHeader(value = "X-Username", required = false) String username) {
        notificationService.markAllAsRead(username);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<NotificationResponse> create(@Valid @RequestBody NotificationCreateRequest request) {
        return ResponseEntity.ok(notificationService.create(request));
    }
}
