package com.simback.perfume.service.implementation;

import com.simback.perfume.exception.ResourceNotFoundException;
import com.simback.perfume.model.*;
import com.simback.perfume.payload.requests.CheckoutPrepareRequest;
import com.simback.perfume.payload.responses.CartItemResponse;
import com.simback.perfume.payload.responses.CheckoutBillResponse;
import com.simback.perfume.payload.responses.CheckoutConfirmResponse;
import com.simback.perfume.repository.*;
import com.simback.perfume.service.CheckoutService;
import com.simback.perfume.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CheckoutServiceImpl implements CheckoutService {
    private static final BigDecimal VAT_RATE = new BigDecimal("10.00");
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("1000000");
    private static final BigDecimal STANDARD_SHIPPING_FEE = new BigDecimal("30000");

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CheckoutDraftRepository checkoutDraftRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public CheckoutBillResponse prepareCheckout(String guestKey, String username, CheckoutPrepareRequest request) {
        Cart cart = resolveCart(guestKey, username);
        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Giỏ hàng đang trống");
        }
        User user = resolveUser(username, cart);
        BigDecimal subtotal = BigDecimal.ZERO;
        int itemsCount = 0;
        for (CartItem item : cart.getItems()) {
            ProductVariant variant = productVariantRepository.findById(item.getVariant().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy variant id: " + item.getVariant().getId()));
            validateStock(variant, item.getQuantity());
            BigDecimal line = item.getUnitPriceSnapshot().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(line);
            itemsCount += item.getQuantity();
        }
        BigDecimal shippingFee = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO
                : STANDARD_SHIPPING_FEE;
        BigDecimal vatAmount = subtotal.add(shippingFee).multiply(VAT_RATE)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = subtotal.add(shippingFee).add(vatAmount);
        String draftNumber = "CHK-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        CheckoutDraft draft = CheckoutDraft.builder()
                .draftNumber(draftNumber)
                .cart(cart)
                .user(user)
                .status(CheckoutStatus.DRAFT)
                .currency(cart.getCurrency())
                .subtotal(subtotal)
                .vatRate(VAT_RATE)
                .vatAmount(vatAmount)
                .shippingFee(shippingFee)
                .discountTotal(BigDecimal.ZERO)
                .grandTotal(grandTotal)
                .recipientName(request.getRecipientName().trim())
                .recipientPhone(request.getRecipientPhone().trim())
                .recipientEmail(request.getRecipientEmail())
                .shippingAddress(request.getShippingAddress().trim())
                .note(request.getNote())
                .build();

        for (CartItem item : cart.getItems()) {
            CheckoutDraftItem draftItem = CheckoutDraftItem.builder()
                    .draft(draft)
                    .product(item.getProduct())
                    .variant(item.getVariant())
                    .productNameSnapshot(item.getProductNameSnapshot())
                    .variantVolumeSnapshot(item.getVariantVolumeSnapshot())
                    .unitPrice(item.getUnitPriceSnapshot())
                    .quantity(item.getQuantity())
                    .lineTotal(item.getUnitPriceSnapshot().multiply(BigDecimal.valueOf(item.getQuantity())))
                    .build();
            draft.getItems().add(draftItem);
        }
        checkoutDraftRepository.save(draft);

        return CheckoutBillResponse.builder()
                .draftNumber(draft.getDraftNumber())
                .cartId(cart.getId())
                .userId(user.getId())
                .recipientName(draft.getRecipientName())
                .recipientPhone(draft.getRecipientPhone())
                .recipientEmail(draft.getRecipientEmail())
                .shippingAddress(draft.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .currency(draft.getCurrency())
                .subtotal(subtotal)
                .discountTotal(BigDecimal.ZERO)
                .shippingFee(shippingFee)
                .vatRate(VAT_RATE)
                .vatAmount(vatAmount)
                .grandTotal(grandTotal)
                .itemsCount(itemsCount)
                .items(cart.getItems().stream().map(this::toItemResponse).toList())
                .build();
    }

    @Override
    @Transactional
    public CheckoutConfirmResponse confirmCheckout(String draftNumber, String username) {
        CheckoutDraft draft = checkoutDraftRepository.findByDraftNumber(draftNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy draft: " + draftNumber));
        if (username != null && !username.isBlank() && !draft.getUser().getUsername().equals(username.toLowerCase())) {
            throw new IllegalArgumentException("Bạn không có quyền xác nhận bill này");
        }

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(draft.getUser())
                .status(OrderStatus.PENDING_CONFIRMATION)
                .paymentStatus(OrderPaymentStatus.UNPAID)
                .paymentMethod(PaymentMethod.COD)
                .currency(draft.getCurrency())
                .subtotal(draft.getSubtotal())
                .vatRate(draft.getVatRate())
                .vatAmount(draft.getVatAmount())
                .shippingFee(draft.getShippingFee())
                .discountTotal(draft.getDiscountTotal())
                .grandTotal(draft.getGrandTotal())
                .recipientName(draft.getRecipientName())
                .recipientPhone(draft.getRecipientPhone())
                .recipientEmail(draft.getRecipientEmail())
                .shippingAddress(draft.getShippingAddress())
                .note(draft.getNote())
                .build();

        for (CheckoutDraftItem draftItem : draft.getItems()) {
            ProductVariant variant = productVariantRepository.findById(draftItem.getVariant().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy variant id: " + draftItem.getVariant().getId()));
            validateStock(variant, draftItem.getQuantity());
            variant.setStockQuantity(variant.getStockQuantity() - draftItem.getQuantity());
            productVariantRepository.save(variant);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(variant.getProduct())
                    .variant(variant)
                    .productNameSnapshot(draftItem.getProductNameSnapshot())
                    .variantVolumeSnapshot(draftItem.getVariantVolumeSnapshot())
                    .thumbnailSnapshot(variant.getProduct().getThumbnail())
                    .unitPrice(draftItem.getUnitPrice())
                    .originalPrice(variant.getOriginalPrice())
                    .discountPercent(variant.getDiscountPercent())
                    .quantity(draftItem.getQuantity())
                    .lineTotal(draftItem.getLineTotal())
                    .build();
            order.getItems().add(orderItem);
        }
        orderRepository.save(order);
        Cart cart = draft.getCart();
        cart.getItems().clear();
        cartItemRepository.deleteAllInBatch(cartItemRepository.findByCart(cart));
        cartRepository.save(cart);
        checkoutDraftRepository.delete(draft);
        notificationService.createForUser(order.getUser().getId(),
                "Đơn hàng mới đã được tạo",
                "Đơn hàng " + order.getOrderNumber() + " đã được tạo thành công.",
                "/account/orders/" + order.getId(),
                order.getItems().isEmpty() ? null : order.getItems().get(0).getThumbnailSnapshot(),
                NotificationType.ORDER.name());

        return CheckoutConfirmResponse.builder()
                .message("Đã tạo đơn hàng thành công")
                .draftNumber(draftNumber)
                .orderNumber(order.getOrderNumber())
                .build();
    }

    private Cart resolveCart(String guestKey, String username) {
        if (username != null && !username.isBlank()) {
            User user = userRepository.findByUsername(username.toLowerCase())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + username));
            return cartRepository.findByUserIdAndStatus(user.getId(), CartStatus.ACTIVE)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giỏ hàng của user"));
        }
        if (guestKey != null && !guestKey.isBlank()) {
            return cartRepository.findByGuestKeyAndStatus(guestKey, CartStatus.ACTIVE)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giỏ hàng khách"));
        }
        throw new IllegalArgumentException("Thiếu thông tin giỏ hàng");
    }

    private User resolveUser(String username, Cart cart) {
        if (username != null && !username.isBlank()) {
            return userRepository.findByUsername(username.toLowerCase())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + username));
        }
        return cart.getUser();
    }

    private void validateStock(ProductVariant variant, Integer quantity) {
        int stock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        if (quantity > stock) {
            throw new IllegalArgumentException("Chỉ còn " + stock + " sản phẩm trong kho");
        }
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
                .build();
    }

    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }
}
