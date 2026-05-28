package com.simback.perfume.service;

import com.simback.perfume.payload.requests.NotificationCreateRequest;
import com.simback.perfume.payload.responses.NotificationResponse;

import java.util.List;

public interface NotificationService {
    NotificationResponse create(NotificationCreateRequest request);

    List<NotificationResponse> getForCurrentUser(String username);

    List<NotificationResponse> getUnreadForCurrentUser(String username);

    long countUnreadForCurrentUser(String username);

    NotificationResponse markAsRead(Long id, String username);

    void markAllAsRead(String username);

    void createForUser(Long userId, String title, String message, String actionUrl, String imageUrl, String type);

    void broadcast(String title, String message, String actionUrl, String imageUrl, String type);
}
