package com.simback.perfume.payload.responses;

import com.simback.perfume.model.CartStatus;
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
public class CartResponse {
    private Long cartId;
    private Long userId;
    private String guestKey;
    private CartStatus status;
    private String currency;
    private BigDecimal subtotal;
    private BigDecimal discountTotal;
    private BigDecimal shippingFee;
    private BigDecimal grandTotal;
    private Integer itemsCount;
    private String couponCode;
    private String note;
    private Instant updatedAt;
    private List<CartItemResponse> items;
}
