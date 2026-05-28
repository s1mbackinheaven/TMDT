package com.simback.perfume.service.implementation;

import com.simback.perfume.exception.ResourceNotFoundException;
import com.simback.perfume.model.*;
import com.simback.perfume.payload.requests.CheckoutCreateRequest;
import com.simback.perfume.payload.responses.PayosCheckoutResponse;
import com.simback.perfume.payload.responses.PayosWebhookResponse;
import com.simback.perfume.repository.CartItemRepository;
import com.simback.perfume.repository.CartRepository;
import com.simback.perfume.repository.OrderRepository;
import com.simback.perfume.repository.ProductVariantRepository;
import com.simback.perfume.repository.UserRepository;
import com.simback.perfume.service.NotificationService;
import com.simback.perfume.service.PayosCheckoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayosCheckoutServiceImpl implements PayosCheckoutService {
    private static final BigDecimal VAT_RATE = new BigDecimal("10.00");
    private static final BigDecimal SHIPPING_FEE = new BigDecimal("30000");

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PayOS payOS;

    @Override
    @Transactional
    public PayosCheckoutResponse createCheckout(String guestKey, String username, CheckoutCreateRequest request) {
        Cart cart = resolveCart(guestKey, username);
        User user = resolveUser(username, cart);
        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Giỏ hàng đang trống");
        }

        BigDecimal subtotal = cart.getItems().stream()
                .map(CartItem::getLineSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal vatAmount = subtotal.add(SHIPPING_FEE).multiply(VAT_RATE)
                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal grandTotal = subtotal.add(SHIPPING_FEE).add(vatAmount);

        Order order = Order.builder()
                .orderNumber(buildOrderNumber())
                .user(user)
                .status(OrderStatus.PENDING_CONFIRMATION)
                .paymentStatus(OrderPaymentStatus.UNPAID)
                .paymentMethod(request.getPaymentMethod())
                .currency(cart.getCurrency())
                .subtotal(subtotal)
                .vatRate(VAT_RATE)
                .vatAmount(vatAmount)
                .shippingFee(SHIPPING_FEE)
                .discountTotal(BigDecimal.ZERO)
                .grandTotal(grandTotal)
                .recipientName(resolveRecipientName(request, user))
                .recipientPhone(request.getRecipientPhone().trim())
                .recipientEmail(request.getRecipientEmail())
                .shippingAddress(request.getShippingAddress().trim())
                .note(request.getNote())
                .build();
        for (CartItem item : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(item.getProduct())
                    .variant(item.getVariant())
                    .productNameSnapshot(item.getProductNameSnapshot())
                    .variantVolumeSnapshot(item.getVariantVolumeSnapshot())
                    .thumbnailSnapshot(item.getThumbnailSnapshot())
                    .unitPrice(item.getUnitPriceSnapshot())
                    .originalPrice(item.getOriginalPriceSnapshot())
                    .discountPercent(item.getDiscountPercentSnapshot())
                    .quantity(item.getQuantity())
                    .lineTotal(item.getLineSubtotal())
                    .build();
            order.getItems().add(orderItem);
        }
        order = orderRepository.saveAndFlush(order);
        reserveStock(order);
        cartItemRepository.deleteAllInBatch(cartItemRepository.findByCart(cart));
        cartRepository.save(cart);
        notificationService.createForUser(
                order.getUser().getId(),
                "Đơn hàng mới đã được tạo",
                "Đơn hàng " + order.getOrderNumber() + " đã được tạo thành công.",
                "/account/orders/" + order.getId(),
                order.getItems().isEmpty() ? null : order.getItems().get(0).getThumbnailSnapshot(),
                NotificationType.ORDER.name());

        if (request.getPaymentMethod() == PaymentMethod.COD) {
            log.info("Created COD order {}", order.getOrderNumber());
            return PayosCheckoutResponse.builder()
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .checkoutUrl(null)
                    .qrCodeUrl(null)
                    .transferContent(null)
                    .message("Đã đặt hàng COD thành công")
                    .build();
        }

        long amount = grandTotal.longValue();
        String transferContent = buildTransferContent(order.getId());
        CreatePaymentLinkRequest paymentRequest = CreatePaymentLinkRequest.builder()
                .orderCode(order.getId())
                .amount(amount)
                .description(transferContent)
                .cancelUrl("https://api.culus.io.vn/api/v1/checkout/payos/cancel")
                .returnUrl("https://api.culus.io.vn/api/v1/checkout/payos/return")
                .build();

        var paymentLink = payOS.paymentRequests().create(paymentRequest);
        log.info("Created PayOS checkout for order {} with content {}", order.getOrderNumber(), transferContent);

        return PayosCheckoutResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .checkoutUrl(paymentLink.getCheckoutUrl())
                .qrCodeUrl(paymentLink.getCheckoutUrl())
                .transferContent(transferContent)
                .message("Đã tạo link thanh toán PayOS")
                .build();
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy order id: " + orderId));
        
        // Chỉ hủy nếu đơn hàng chưa thanh toán
        if (order.getPaymentStatus() != OrderPaymentStatus.PAID && order.getStatus() != OrderStatus.CANCELLED) {
            order.setStatus(OrderStatus.CANCELLED);
            order.setAdminNote("Người dùng hủy thanh toán PayOS");
            orderRepository.save(order);
            restoreStock(order);

            // Gửi thông báo hủy đơn cho user
            if (order.getUser() != null) {
                notificationService.createForUser(
                        order.getUser().getId(),
                        "Hủy đơn hàng",
                        "Đơn hàng " + order.getOrderNumber() + " đã bị hủy do bạn hủy thanh toán.",
                        "/account/orders/" + order.getId(),
                        order.getItems().isEmpty() ? null : order.getItems().get(0).getThumbnailSnapshot(),
                        NotificationType.ORDER.name());
            }
        }
    }

    @Override
    @Transactional
    public PayosWebhookResponse handleWebhook(Webhook webhook) {
        log.info("Received PayOS webhook: {}", webhook);
        try {
            WebhookData verified = payOS.webhooks().verify(webhook);
            Long orderId = verified.getOrderCode();
            
            // Xử lý webhook giả/test từ PayOS khi gọi api confirm-webhook
            if ("VQRIO123".equals(verified.getDescription())) {
                log.info("Bỏ qua cập nhật DB vì đây là Test Webhook từ PayOS (orderCode={})", orderId);
                return PayosWebhookResponse.builder()
                        .message("Test webhook OK")
                        .build();
            }

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy order id: " + orderId));

            order.setPaymentStatus(OrderPaymentStatus.PAID);
            order.setPaid(Boolean.TRUE);
            order.setAdminNote("Đã thanh toán");
            orderRepository.save(order);
            notificationService.createForUser(
                    order.getUser().getId(),
                    "Thanh toán thành công",
                    "Đơn hàng " + order.getOrderNumber() + " đã được thanh toán thành công.",
                    "/account/orders/" + order.getId(),
                    order.getItems().isEmpty() ? null : order.getItems().get(0).getThumbnailSnapshot(),
                    NotificationType.ORDER.name());

            return PayosWebhookResponse.builder()
                    .message("Webhook hợp lệ, đơn hàng đã được cập nhật PAID")
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .status("PAID")
                    .build();
        } catch (Exception e) {
            log.error("Webhook PayOS không hợp lệ", e);
            return PayosWebhookResponse.builder()
                    .message("Webhook không hợp lệ: " + e.getMessage())
                    .build();
        }
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

    private String resolveRecipientName(CheckoutCreateRequest request, User user) {
        if (request.getRecipientName() != null && !request.getRecipientName().isBlank()) {
            return request.getRecipientName().trim();
        }
        return user != null ? user.getFullName() : "Khách hàng";
    }

    private String buildOrderNumber() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String shortPart = timestamp.length() > 6 ? timestamp.substring(timestamp.length() - 6) : timestamp;
        return "XB" + shortPart + "2004";
    }

    private String buildTransferContent(Long orderId) {
        return "XB" + orderId + "2004";
    }

    private void reserveStock(Order order) {
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getVariant();
            int currentStock = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
            int reserved = item.getQuantity() == null ? 0 : item.getQuantity();
            if (currentStock < reserved) {
                throw new IllegalArgumentException("Không đủ tồn kho cho variant id: " + variant.getId());
            }
            variant.setStockQuantity(currentStock - reserved);
            variant.setSoldCount((variant.getSoldCount() == null ? 0 : variant.getSoldCount()) + reserved);
            productVariantRepository.save(variant);
        }
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getVariant();
            if (variant != null) {
                int currentStock = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
                int restored = item.getQuantity() == null ? 0 : item.getQuantity();
                
                variant.setStockQuantity(currentStock + restored);
                
                int currentSold = variant.getSoldCount() == null ? 0 : variant.getSoldCount();
                variant.setSoldCount(Math.max(0, currentSold - restored));
                
                productVariantRepository.save(variant);
            }
        }
    }
}
