package com.simback.perfume.payload.responses;

import com.simback.perfume.model.OrderPaymentStatus;
import com.simback.perfume.model.OrderStatus;
import com.simback.perfume.model.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String username;
    private OrderStatus status;
    private OrderPaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private String currency;
    private BigDecimal subtotal;
    private BigDecimal vatRate;
    private BigDecimal vatAmount;
    private BigDecimal shippingFee;
    private BigDecimal discountTotal;
    private BigDecimal grandTotal;
    private String recipientName;
    private String recipientPhone;
    private String recipientEmail;
    private String shippingAddress;
    private String note;
    private String adminNote;
    private Boolean paid;
    private Instant createdAt;
    private Instant updatedAt;
    private Integer earnedPoints;
    private BigDecimal loyaltyDiscountAmount;
    private List<OrderItemResponse> items;
}
