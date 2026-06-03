package com.simback.perfume.repository;

import com.simback.perfume.model.Notification;
import com.simback.perfume.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query("SELECT n FROM Notification n WHERE n.recipient.id = :recipientId OR n.recipient IS NULL ORDER BY n.createdAt DESC")
    List<Notification> findForUser(@Param("recipientId") Long recipientId);

    @Query("SELECT n FROM Notification n WHERE (n.recipient.id = :recipientId OR n.recipient IS NULL) AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadForUser(@Param("recipientId") Long recipientId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.recipient.id = :recipientId OR n.recipient IS NULL) AND n.isRead = false")
    long countUnreadForUser(@Param("recipientId") Long recipientId);
    
    List<Notification> findByTypeOrderByCreatedAtDesc(NotificationType type);
}
