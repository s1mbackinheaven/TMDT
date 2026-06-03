package com.simback.perfume.controller;

import com.simback.perfume.model.OrderPaymentStatus;
import com.simback.perfume.model.OrderStatus;
import com.simback.perfume.payload.requests.OrderStatusUpdateRequest;
import com.simback.perfume.payload.responses.OrderResponse;
import com.simback.perfume.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @GetMapping("/me")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@RequestParam(value = "status", required = false) OrderStatus status,
                                                            @RequestParam(value = "paymentStatus", required = false) OrderPaymentStatus paymentStatus,
                                                            @RequestParam(value = "from", required = false) Instant from,
                                                            @RequestParam(value = "to", required = false) Instant to) {
        return ResponseEntity.ok(orderService.getMyOrders(resolveUsername(), status, paymentStatus, from, to));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders(@RequestParam(value = "status", required = false) OrderStatus status,
                                                             @RequestParam(value = "paymentStatus", required = false) OrderPaymentStatus paymentStatus,
                                                             @RequestParam(value = "from", required = false) Instant from,
                                                             @RequestParam(value = "to", required = false) Instant to) {
        return ResponseEntity.ok(orderService.getAllOrders(status, paymentStatus, from, to));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId, resolveUsername()));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long orderId,
                                                           @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, request, resolveUsername()));
    }

    @PatchMapping("/{orderId}/payment-status")
    public ResponseEntity<OrderResponse> updateOrderPaymentStatus(@PathVariable Long orderId,
                                                                  @Valid @RequestBody com.simback.perfume.payload.requests.OrderPaymentStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateOrderPaymentStatus(orderId, request, resolveUsername()));
    }

    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, resolveUsername()));
    }

    @PatchMapping("/{orderId}/received")
    public ResponseEntity<OrderResponse> confirmReceived(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.confirmReceived(orderId, resolveUsername()));
    }

    private String resolveUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            return null;
        }
        String name = authentication.getName();
        return "anonymousUser".equalsIgnoreCase(name) ? null : name;
    }
}
