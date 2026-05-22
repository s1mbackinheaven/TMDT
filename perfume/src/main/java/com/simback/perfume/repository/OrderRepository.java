package com.simback.perfume.repository;

import com.simback.perfume.model.Order;
import com.simback.perfume.model.OrderPaymentStatus;
import com.simback.perfume.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
    List<Order> findByPaymentStatusOrderByCreatedAtDesc(OrderPaymentStatus paymentStatus);
    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(Instant from, Instant to);
    List<Order> findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(OrderStatus status, Instant from, Instant to);
    List<Order> findByPaymentStatusAndCreatedAtBetweenOrderByCreatedAtDesc(OrderPaymentStatus paymentStatus, Instant from, Instant to);
    List<Order> findByStatusAndPaymentStatusAndCreatedAtBetweenOrderByCreatedAtDesc(OrderStatus status, OrderPaymentStatus paymentStatus, Instant from, Instant to);
}
