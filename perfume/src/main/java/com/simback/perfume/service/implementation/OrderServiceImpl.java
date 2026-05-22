package com.simback.perfume.service.implementation;

import com.simback.perfume.exception.ResourceNotFoundException;
import com.simback.perfume.model.*;
import com.simback.perfume.payload.requests.OrderStatusUpdateRequest;
import com.simback.perfume.payload.responses.OrderItemResponse;
import com.simback.perfume.payload.responses.OrderResponse;
import com.simback.perfume.repository.OrderRepository;
import com.simback.perfume.repository.ProductVariantRepository;
import com.simback.perfume.repository.UserRepository;
import com.simback.perfume.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(String username) {
        User user = resolveUser(username);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders(OrderStatus status, OrderPaymentStatus paymentStatus, Instant from, Instant to) {
        List<Order> orders;
        if (from != null && to != null) {
            if (status != null && paymentStatus != null) {
                orders = orderRepository.findByStatusAndPaymentStatusAndCreatedAtBetweenOrderByCreatedAtDesc(status, paymentStatus, from, to);
            } else if (status != null) {
                orders = orderRepository.findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(status, from, to);
            } else if (paymentStatus != null) {
                orders = orderRepository.findByPaymentStatusAndCreatedAtBetweenOrderByCreatedAtDesc(paymentStatus, from, to);
            } else {
                orders = orderRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(from, to);
            }
        } else {
            orders = orderRepository.findAll().stream()
                    .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
                    .toList();
            if (status != null) {
                orders = orders.stream().filter(order -> order.getStatus() == status).toList();
            }
            if (paymentStatus != null) {
                orders = orders.stream().filter(order -> order.getPaymentStatus() == paymentStatus).toList();
            }
        }
        return orders.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, String username) {
        Order order = getOrder(orderId);
        authorizeAccess(order, username);
        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request, String username) {
        Order order = getOrder(orderId);
        authorizeAdmin(username);
        applyStatus(order, request.getStatus(), request.getAdminNote());
        orderRepository.save(order);
        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long orderId, String username) {
        Order order = getOrder(orderId);
        authorizeAccess(order, username);
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new IllegalArgumentException("Không thể hủy đơn đã hoàn thành");
        }
        order.setStatus(OrderStatus.CANCELLED);
        order.setAdminNote("Đơn hàng đã bị hủy");
        restoreStock(order);
        orderRepository.save(order);
        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse confirmReceived(Long orderId, String username) {
        Order order = getOrder(orderId);
        authorizeAccess(order, username);
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalArgumentException("Chỉ có thể xác nhận khi đơn đã được giao");
        }
        order.setStatus(OrderStatus.COMPLETED);
        order.setAdminNote(composeNote(order.getAdminNote(), "Khách đã xác nhận nhận hàng"));
        orderRepository.save(order);
        return toResponse(order);
    }

    private void applyStatus(Order order, OrderStatus nextStatus, String adminNote) {
        OrderStatus current = order.getStatus();
        if (current == OrderStatus.CANCELLED || current == OrderStatus.COMPLETED) {
            throw new IllegalArgumentException("Không thể cập nhật đơn đã kết thúc");
        }
        if (!isValidTransition(current, nextStatus)) {
            throw new IllegalArgumentException("Chuyển trạng thái không hợp lệ: " + current + " -> " + nextStatus);
        }
        order.setStatus(nextStatus);
        if (adminNote != null && !adminNote.isBlank()) {
            order.setAdminNote(adminNote.trim());
        }
        if (nextStatus == OrderStatus.PROCESSING) {
            order.setAdminNote(composeNote(order.getAdminNote(), order.getPaymentMethod() == PaymentMethod.COD ? "Chưa thanh toán" : "Đã thanh toán"));
        }
        if (nextStatus == OrderStatus.DELIVERED) {
            order.setAdminNote(composeNote(order.getAdminNote(), "Đã giao hàng"));
            order.setPaymentStatus(OrderPaymentStatus.PAID);
            order.setPaid(Boolean.TRUE);
        }
        if (nextStatus == OrderStatus.COMPLETED) {
            order.setAdminNote(composeNote(order.getAdminNote(), "Hoàn thành đơn hàng"));
        }
    }

    private boolean isValidTransition(OrderStatus current, OrderStatus next) {
        return switch (current) {
            case PENDING_CONFIRMATION -> next == OrderStatus.PROCESSING || next == OrderStatus.CANCELLED;
            case PROCESSING -> next == OrderStatus.SHIPPED || next == OrderStatus.CANCELLED;
            case SHIPPED -> next == OrderStatus.DELIVERED || next == OrderStatus.CANCELLED;
            case DELIVERED -> next == OrderStatus.COMPLETED;
            default -> false;
        };
    }

    private String composeNote(String current, String appended) {
        if (current == null || current.isBlank()) {
            return appended;
        }
        if (current.contains(appended)) {
            return current;
        }
        return current + " | " + appended;
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getVariant();
            int currentStock = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
            int restored = item.getQuantity() == null ? 0 : item.getQuantity();
            variant.setStockQuantity(currentStock + restored);
            int sold = variant.getSoldCount() == null ? 0 : variant.getSoldCount();
            variant.setSoldCount(Math.max(0, sold - restored));
            productVariantRepository.save(variant);
        }
    }

    private Order getOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy order id: " + orderId));
    }

    private void authorizeAccess(Order order, String username) {
        if (username == null || username.isBlank()) {
            return;
        }
        User user = resolveUser(username);
        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xem đơn này");
        }
    }

    private void authorizeAdmin(String username) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Thiếu thông tin user");
        }
        User user = resolveUser(username);
        if (user.getRole() == null || user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Bạn không có quyền cập nhật trạng thái đơn hàng");
        }
    }

    private User resolveUser(String username) {
        return userRepository.findByUsername(username.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + username));
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .username(order.getUser().getUsername())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .currency(order.getCurrency())
                .subtotal(order.getSubtotal())
                .vatRate(order.getVatRate())
                .vatAmount(order.getVatAmount())
                .shippingFee(order.getShippingFee())
                .discountTotal(order.getDiscountTotal())
                .grandTotal(order.getGrandTotal())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .recipientEmail(order.getRecipientEmail())
                .shippingAddress(order.getShippingAddress())
                .note(order.getNote())
                .adminNote(order.getAdminNote())
                .paid(order.getPaid())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(order.getItems().stream().map(this::toItemResponse).toList())
                .build();
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .variantId(item.getVariant().getId())
                .productName(item.getProductNameSnapshot())
                .variantVolume(item.getVariantVolumeSnapshot())
                .thumbnail(item.getThumbnailSnapshot())
                .unitPrice(item.getUnitPrice())
                .originalPrice(item.getOriginalPrice())
                .discountPercent(item.getDiscountPercent())
                .quantity(item.getQuantity())
                .lineTotal(item.getLineTotal())
                .build();
    }
}
