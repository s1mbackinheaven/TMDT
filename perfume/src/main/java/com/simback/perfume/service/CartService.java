package com.simback.perfume.service;

import com.simback.perfume.payload.requests.AddCartItemRequest;
import com.simback.perfume.payload.requests.UpdateCartItemRequest;
import com.simback.perfume.payload.responses.CartResponse;

public interface CartService {
    CartResponse getCurrentCart(String guestKey, String username);
    CartResponse addItem(String guestKey, String username, AddCartItemRequest request);
    CartResponse updateItem(Long cartItemId, String guestKey, String username, UpdateCartItemRequest request);
    CartResponse removeItem(Long cartItemId, String guestKey, String username);
    CartResponse clearCart(String guestKey, String username);
    CartResponse mergeGuestCart(String guestKey, String username);
}
