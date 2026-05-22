package com.simback.perfume.repository;

import com.simback.perfume.model.Cart;
import com.simback.perfume.model.CartStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserIdAndStatus(Long userId, CartStatus status);
    Optional<Cart> findByGuestKeyAndStatus(String guestKey, CartStatus status);
}
