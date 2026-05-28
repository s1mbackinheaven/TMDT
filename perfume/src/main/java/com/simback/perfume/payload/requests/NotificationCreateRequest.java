package com.simback.perfume.payload.requests;

import com.simback.perfume.model.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationCreateRequest {
    private Long recipientUserId;

    @NotNull(message = "Type không được trống")
    private NotificationType type;

    @NotBlank(message = "Title không được trống")
    private String title;

    @NotBlank(message = "Message không được trống")
    private String message;

    private String actionUrl;
    private String imageUrl;
}
