package com.simback.perfume.repository;

import com.simback.perfume.model.Notification;
import com.simback.perfume.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    List<Notification> findByRecipientIsNullOrderByCreatedAtDesc();
    List<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(Long recipientId);
    long countByRecipientIdAndIsReadFalse(Long recipientId);
    List<Notification> findByTypeOrderByCreatedAtDesc(NotificationType type);
}
