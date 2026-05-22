package com.simback.perfume.repository;

import com.simback.perfume.model.Cart;
import com.simback.perfume.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndVariantId(Long cartId, Long variantId);
    List<CartItem> findByCart(Cart cart);
}
