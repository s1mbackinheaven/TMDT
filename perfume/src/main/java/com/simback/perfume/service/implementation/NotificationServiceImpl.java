package com.simback.perfume.service.implementation;

import com.simback.perfume.exception.ResourceNotFoundException;
import com.simback.perfume.model.Notification;
import com.simback.perfume.model.NotificationType;
import com.simback.perfume.model.User;
import com.simback.perfume.payload.requests.NotificationCreateRequest;
import com.simback.perfume.payload.responses.NotificationResponse;
import com.simback.perfume.repository.NotificationRepository;
import com.simback.perfume.repository.UserRepository;
import com.simback.perfume.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public NotificationResponse create(NotificationCreateRequest request) {
        User recipient = request.getRecipientUserId() == null ? null : userRepository.findById(request.getRecipientUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user id: " + request.getRecipientUserId()));
        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(request.getType())
                .title(request.getTitle().trim())
                .message(request.getMessage().trim())
                .actionUrl(request.getActionUrl())
                .imageUrl(request.getImageUrl())
                .build();
        return toResponse(notificationRepository.save(notification));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getForCurrentUser(String username) {
        User user = resolveUser(resolveUsername(username));
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId()).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadForCurrentUser(String username) {
        User user = resolveUser(resolveUsername(username));
        return notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(user.getId()).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnreadForCurrentUser(String username) {
        User user = resolveUser(resolveUsername(username));
        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long id, String username) {
        User user = resolveUser(resolveUsername(username));
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy notification id: " + id));
        if (notification.getRecipient() != null && !notification.getRecipient().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa notification này");
        }
        notification.setIsRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public void markAllAsRead(String username) {
        User user = resolveUser(resolveUsername(username));
        var unread = notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public void createForUser(Long userId, String title, String message, String actionUrl, String imageUrl, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user id: " + userId));
        Notification notification = Notification.builder()
                .recipient(user)
                .type(NotificationType.valueOf(type))
                .title(title)
                .message(message)
                .actionUrl(actionUrl)
                .imageUrl(imageUrl)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void broadcast(String title, String message, String actionUrl, String imageUrl, String type) {
        Notification notification = Notification.builder()
                .recipient(null)
                .type(NotificationType.valueOf(type))
                .title(title)
                .message(message)
                .actionUrl(actionUrl)
                .imageUrl(imageUrl)
                .build();
        notificationRepository.save(notification);
    }

    private String resolveUsername(String username) {
        if (username != null && !username.isBlank()) return username;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalArgumentException("Thiếu thông tin user đăng nhập");
        }
        return authentication.getName();
    }

    private User resolveUser(String username) {
        return userRepository.findByUsername(username.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + username));
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .recipientUserId(n.getRecipient() == null ? null : n.getRecipient().getId())
                .recipientUsername(n.getRecipient() == null ? null : n.getRecipient().getUsername())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .actionUrl(n.getActionUrl())
                .imageUrl(n.getImageUrl())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }
}
