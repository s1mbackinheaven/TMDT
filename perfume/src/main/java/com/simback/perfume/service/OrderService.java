package com.simback.perfume.service;

import com.simback.perfume.model.OrderPaymentStatus;
import com.simback.perfume.model.OrderStatus;
import com.simback.perfume.payload.requests.OrderStatusUpdateRequest;
import com.simback.perfume.payload.responses.OrderResponse;

import java.time.Instant;
import java.util.List;

public interface OrderService {
    List<OrderResponse> getMyOrders(String username);
    List<OrderResponse> getAllOrders(OrderStatus status, OrderPaymentStatus paymentStatus, Instant from, Instant to);
    OrderResponse getOrderById(Long orderId, String username);
    OrderResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request, String username);
    OrderResponse cancelOrder(Long orderId, String username);
    OrderResponse confirmReceived(Long orderId, String username);
}
