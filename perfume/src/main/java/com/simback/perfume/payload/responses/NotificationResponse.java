package com.simback.perfume.payload.responses;

import com.simback.perfume.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long id;
    private Long recipientUserId;
    private String recipientUsername;
    private NotificationType type;
    private String title;
    private String message;
    private String actionUrl;
    private String imageUrl;
    private Boolean isRead;
    private Instant createdAt;
    private Instant updatedAt;
}
