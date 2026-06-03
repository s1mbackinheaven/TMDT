package com.simback.perfume.service.implementation;

import com.simback.perfume.exception.ResourceNotFoundException;
import com.simback.perfume.model.*;
import com.simback.perfume.payload.requests.AddCartItemRequest;
import com.simback.perfume.payload.requests.UpdateCartItemRequest;
import com.simback.perfume.payload.responses.CartItemResponse;
import com.simback.perfume.payload.responses.CartResponse;
import com.simback.perfume.payload.responses.VariantOptionResponse;
import com.simback.perfume.repository.CartItemRepository;
import com.simback.perfume.repository.CartRepository;
import com.simback.perfume.repository.ProductVariantRepository;
import com.simback.perfume.repository.UserRepository;
import com.simback.perfume.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final com.simback.perfume.service.PricingService pricingService;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCurrentCart(String guestKey, String username) {
        Cart cart = resolveCart(guestKey, username, false);
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItem(String guestKey, String username, AddCartItemRequest request) {
        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy variant id: " + request.getVariantId()));
        validateVariantCanBeAdded(variant, request.getQuantity());
        Cart cart = resolveCart(guestKey, username, true);
        CartItem item = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId()).orElse(null);
        int newQuantity = request.getQuantity();
        if (item != null) {
            newQuantity = item.getQuantity() + request.getQuantity();
            validateStock(variant, newQuantity);
            updateItemFromVariant(item, variant, newQuantity);
        } else {
            validateStock(variant, newQuantity);
            item = createItem(cart, variant, newQuantity);
            cart.getItems().add(item);
        }
        recalculateCart(cart);
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateItem(Long cartItemId, String guestKey, String username, UpdateCartItemRequest request) {
        CartItem item = getOwnedItem(cartItemId, guestKey, username);
        ProductVariant currentVariant = item.getVariant();
        ProductVariant targetVariant = currentVariant;
        if (request.getVariantId() != null && !request.getVariantId().equals(currentVariant.getId())) {
            targetVariant = productVariantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy variant id: " + request.getVariantId()));
            validateVariantCanBeAdded(targetVariant, request.getQuantity() != null ? request.getQuantity() : item.getQuantity());
        }

        int newQuantity = request.getQuantity() != null ? request.getQuantity() : item.getQuantity();
        validateStock(targetVariant, newQuantity);

        Cart cart = item.getCart();
        if (!targetVariant.getId().equals(currentVariant.getId())) {
            CartItem duplicate = cartItemRepository.findByCartIdAndVariantId(cart.getId(), targetVariant.getId()).orElse(null);
            if (duplicate != null && !duplicate.getId().equals(item.getId())) {
                int mergedQuantity = duplicate.getQuantity() + newQuantity;
                validateStock(targetVariant, mergedQuantity);
                updateItemFromVariant(duplicate, targetVariant, mergedQuantity);
                cart.getItems().remove(item);
                cartItemRepository.delete(item);
            } else {
                updateItemFromVariant(item, targetVariant, newQuantity);
            }
        } else {
            updateItemFromVariant(item, targetVariant, newQuantity);
        }

        recalculateCart(cart);
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long cartItemId, String guestKey, String username) {
        CartItem item = getOwnedItem(cartItemId, guestKey, username);
        Cart cart = item.getCart();
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        recalculateCart(cart);
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse clearCart(String guestKey, String username) {
        Cart cart = resolveCart(guestKey, username, false);
        cart.getItems().clear();
        cartItemRepository.deleteAllInBatch(cartItemRepository.findByCart(cart));
        recalculateCart(cart);
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse mergeGuestCart(String guestKey, String username) {
        if (guestKey == null || guestKey.isBlank() || username == null || username.isBlank()) {
            return getCurrentCart(guestKey, username);
        }
        Cart guestCart = cartRepository.findByGuestKeyAndStatus(guestKey, CartStatus.ACTIVE)
                .orElseGet(() -> createGuestCart(guestKey));
        Cart userCart = resolveCart(null, username, true);
        for (CartItem guestItem : List.copyOf(guestCart.getItems())) {
            CartItem existing = cartItemRepository.findByCartIdAndVariantId(userCart.getId(), guestItem.getVariant().getId()).orElse(null);
            int mergedQuantity = guestItem.getQuantity();
            if (existing != null) {
                mergedQuantity += existing.getQuantity();
                validateStock(guestItem.getVariant(), mergedQuantity);
                updateItemFromVariant(existing, guestItem.getVariant(), mergedQuantity);
            } else {
                validateStock(guestItem.getVariant(), mergedQuantity);
                CartItem newItem = copyItem(userCart, guestItem, mergedQuantity);
                userCart.getItems().add(newItem);
            }
        }
        guestCart.getItems().clear();
        cartItemRepository.deleteAllInBatch(cartItemRepository.findByCart(guestCart));
        recalculateCart(userCart);
        cartRepository.save(userCart);
        cartRepository.delete(guestCart);
        return toResponse(userCart);
    }

    private Cart resolveCart(String guestKey, String username, boolean createIfMissing) {
        if (username != null && !username.isBlank()) {
            User user = userRepository.findByUsername(username.toLowerCase())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + username));
            return cartRepository.findByUserIdAndStatus(user.getId(), CartStatus.ACTIVE)
                    .orElseGet(() -> createUserCart(user, createIfMissing));
        }
        if (guestKey != null && !guestKey.isBlank()) {
            return cartRepository.findByGuestKeyAndStatus(guestKey, CartStatus.ACTIVE)
                    .orElseGet(() -> createGuestCart(guestKey));
        }
        throw new IllegalArgumentException("Phải có username hoặc guestKey để xác định giỏ hàng");
    }

    private Cart createUserCart(User user, boolean createIfMissing) {
        if (!createIfMissing) {
            return null;
        }
        Cart cart = Cart.builder().user(user).status(CartStatus.ACTIVE).build();
        return cartRepository.save(cart);
    }

    private Cart createGuestCart(String guestKey) {
        Cart cart = Cart.builder().guestKey(guestKey).status(CartStatus.ACTIVE).build();
        return cartRepository.save(cart);
    }

    private CartItem getOwnedItem(Long cartItemId, String guestKey, String username) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cart item id: " + cartItemId));
        Cart cart = item.getCart();
        if (username != null && cart.getUser() != null && cart.getUser().getUsername().equals(username.toLowerCase())) {
            return item;
        }
        if (guestKey != null && guestKey.equals(cart.getGuestKey())) {
            return item;
        }
        throw new IllegalArgumentException("Bạn không có quyền thao tác với cart item này");
    }

    private void validateVariantCanBeAdded(ProductVariant variant, Integer quantity) {
        if (variant == null) {
            throw new IllegalArgumentException("Variant không hợp lệ");
        }
        if (variant.getProduct() == null || variant.getProduct().getStatus() != ProductStatus.ACTIVE) {
            throw new IllegalArgumentException("Sản phẩm hiện không khả dụng");
        }
        if (quantity == null || quantity < 1) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }
    }

    private void validateStock(ProductVariant variant, Integer quantity) {
        int stock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        if (quantity == null || quantity < 1) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }
        if (quantity > stock) {
            throw new IllegalArgumentException("Chỉ còn " + stock + " sản phẩm trong kho");
        }
    }

    private CartItem createItem(Cart cart, ProductVariant variant, int quantity) {
        return CartItem.builder()
                .cart(cart)
                .product(variant.getProduct())
                .variant(variant)
                .productNameSnapshot(variant.getProduct().getName())
                .variantVolumeSnapshot(variant.getVolume())
                .thumbnailSnapshot(variant.getProduct().getThumbnail())
                .unitPriceSnapshot(pricingService.calculateEffectivePrice(variant))
                .originalPriceSnapshot(variant.getOriginalPrice() != null ? variant.getOriginalPrice() : variant.getPrice())
                .discountPercentSnapshot(pricingService.calculateEffectiveDiscountPercent(variant))
                .quantity(quantity)
                .availableStockSnapshot(variant.getStockQuantity() != null ? variant.getStockQuantity() : 0)
                .lineSubtotal(calculateLineSubtotal(pricingService.calculateEffectivePrice(variant), quantity))
                .status(determineStatus(variant))
                .build();
    }

    private void updateItemFromVariant(CartItem item, ProductVariant variant, int quantity) {
        item.setProduct(variant.getProduct());
        item.setVariant(variant);
        item.setProductNameSnapshot(variant.getProduct().getName());
        item.setVariantVolumeSnapshot(variant.getVolume());
        item.setThumbnailSnapshot(variant.getProduct().getThumbnail());
        item.setUnitPriceSnapshot(pricingService.calculateEffectivePrice(variant));
        item.setOriginalPriceSnapshot(variant.getOriginalPrice() != null ? variant.getOriginalPrice() : variant.getPrice());
        item.setDiscountPercentSnapshot(pricingService.calculateEffectiveDiscountPercent(variant));
        item.setQuantity(quantity);
        item.setAvailableStockSnapshot(variant.getStockQuantity() != null ? variant.getStockQuantity() : 0);
        item.setLineSubtotal(calculateLineSubtotal(pricingService.calculateEffectivePrice(variant), quantity));
        item.setStatus(determineStatus(variant));
    }

    private CartItem copyItem(Cart cart, CartItem source, int quantity) {
        return CartItem.builder()
                .cart(cart)
                .product(source.getProduct())
                .variant(source.getVariant())
                .productNameSnapshot(source.getProductNameSnapshot())
                .variantVolumeSnapshot(source.getVariantVolumeSnapshot())
                .thumbnailSnapshot(source.getThumbnailSnapshot())
                .unitPriceSnapshot(source.getUnitPriceSnapshot())
                .originalPriceSnapshot(source.getOriginalPriceSnapshot())
                .discountPercentSnapshot(source.getDiscountPercentSnapshot())
                .quantity(quantity)
                .availableStockSnapshot(source.getAvailableStockSnapshot())
                .lineSubtotal(calculateLineSubtotal(source.getUnitPriceSnapshot(), quantity))
                .status(source.getStatus())
                .build();
    }

    private void recalculateCart(Cart cart) {
        List<CartItem> items = cart.getItems();
        BigDecimal subtotal = BigDecimal.ZERO;
        int count = 0;
        for (CartItem item : items) {
            BigDecimal lineSubtotal = calculateLineSubtotal(item.getUnitPriceSnapshot(), item.getQuantity());
            item.setLineSubtotal(lineSubtotal);
            subtotal = subtotal.add(lineSubtotal);
            count += item.getQuantity();
        }
        cart.setItemsCount(count);
        cart.setSubtotal(subtotal);
        cart.setDiscountTotal(BigDecimal.ZERO);
        cart.setShippingFee(BigDecimal.ZERO);
        cart.setGrandTotal(subtotal);
    }

    private BigDecimal calculateLineSubtotal(BigDecimal price, int quantity) {
        BigDecimal safePrice = price != null ? price : BigDecimal.ZERO;
        return safePrice.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
    }

    private CartItemStatus determineStatus(ProductVariant variant) {
        if (variant.getProduct() == null || variant.getProduct().getStatus() != ProductStatus.ACTIVE) {
            return CartItemStatus.DISCONTINUED;
        }
        if ((variant.getStockQuantity() == null ? 0 : variant.getStockQuantity()) <= 0) {
            return CartItemStatus.OUT_OF_STOCK;
        }
        return CartItemStatus.ACTIVE;
    }

    private CartResponse toResponse(Cart cart) {
        if (cart == null) {
            return CartResponse.builder().items(List.of()).subtotal(BigDecimal.ZERO).discountTotal(BigDecimal.ZERO).shippingFee(BigDecimal.ZERO).grandTotal(BigDecimal.ZERO).itemsCount(0).build();
        }
        return CartResponse.builder()
                .cartId(cart.getId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .guestKey(cart.getGuestKey())
                .status(cart.getStatus())
                .currency(cart.getCurrency())
                .subtotal(cart.getSubtotal())
                .discountTotal(cart.getDiscountTotal())
                .shippingFee(cart.getShippingFee())
                .grandTotal(cart.getGrandTotal())
                .itemsCount(cart.getItemsCount())
                .couponCode(cart.getCouponCode())
                .note(cart.getNote())
                .updatedAt(cart.getUpdatedAt())
                .items(cart.getItems().stream().map(this::toItemResponse).toList())
                .build();
    }

    private CartItemResponse toItemResponse(CartItem item) {
        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .variantId(item.getVariant().getId())
                .productName(item.getProductNameSnapshot())
                .productSlug(item.getProduct().getSlug())
                .variantVolume(item.getVariantVolumeSnapshot())
                .thumbnail(item.getThumbnailSnapshot())
                .unitPrice(item.getUnitPriceSnapshot())
                .originalPrice(item.getOriginalPriceSnapshot())
                .discountPercent(item.getDiscountPercentSnapshot())
                .quantity(item.getQuantity())
                .availableStock(item.getAvailableStockSnapshot())
                .lineSubtotal(item.getLineSubtotal())
                .status(item.getStatus())
                .variantOptions(loadVariantOptions(item))
                .build();
    }

    private List<VariantOptionResponse> loadVariantOptions(CartItem item) {
        List<ProductVariant> variants = productVariantRepository.findByProductIdOrderBySortOrder(item.getProduct().getId());
        List<VariantOptionResponse> options = new ArrayList<>();
        for (ProductVariant variant : variants) {
            options.add(new VariantOptionResponse(
                    variant.getId(),
                    variant.getVolume(),
                    pricingService.calculateEffectivePrice(variant),
                    variant.getOriginalPrice() != null ? variant.getOriginalPrice() : variant.getPrice(),
                    pricingService.calculateEffectiveDiscountPercent(variant),
                    variant.getStockQuantity(),
                    variant.getId().equals(item.getVariant().getId())
            ));
        }
        return options;
    }
}
