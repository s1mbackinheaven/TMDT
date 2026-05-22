package com.simback.perfume.repository;

import com.simback.perfume.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PayosOrderMappingRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
}
