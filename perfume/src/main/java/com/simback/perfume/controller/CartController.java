package com.simback.perfume.controller;

import com.simback.perfume.payload.requests.AddCartItemRequest;
import com.simback.perfume.payload.requests.UpdateCartItemRequest;
import com.simback.perfume.payload.responses.CartResponse;
import com.simback.perfume.service.CartService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCurrentCart(HttpServletRequest request) {
        return ResponseEntity.ok(cartService.getCurrentCart(resolveGuestKey(request), resolveUsername()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@Valid @RequestBody AddCartItemRequest request, HttpServletRequest servletRequest) {
        return ResponseEntity.ok(cartService.addItem(resolveGuestKey(servletRequest), resolveUsername(), request));
    }

    @PatchMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateItem(@PathVariable Long cartItemId,
                                                   @Valid @RequestBody UpdateCartItemRequest request,
                                                   HttpServletRequest servletRequest) {
        return ResponseEntity.ok(cartService.updateItem(cartItemId, resolveGuestKey(servletRequest), resolveUsername(), request));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable Long cartItemId, HttpServletRequest servletRequest) {
        return ResponseEntity.ok(cartService.removeItem(cartItemId, resolveGuestKey(servletRequest), resolveUsername()));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<CartResponse> clearCart(HttpServletRequest servletRequest) {
        return ResponseEntity.ok(cartService.clearCart(resolveGuestKey(servletRequest), resolveUsername()));
    }

    @PostMapping("/merge")
    public ResponseEntity<CartResponse> mergeGuestCart(HttpServletRequest servletRequest) {
        return ResponseEntity.ok(cartService.mergeGuestCart(resolveGuestKey(servletRequest), resolveUsername()));
    }

    private String resolveUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            return null;
        }
        String name = authentication.getName();
        return "anonymousUser".equalsIgnoreCase(name) ? null : name;
    }

    private String resolveGuestKey(HttpServletRequest request) {
        return request.getHeader("X-Guest-Key");
    }
}
