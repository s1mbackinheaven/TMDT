package com.simback.perfume.payload.responses;

import com.simback.perfume.model.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutBillResponse {
    private String draftNumber;
    private String orderNumber;
    private Long cartId;
    private Long userId;
    private String recipientName;
    private String recipientPhone;
    private String recipientEmail;
    private String shippingAddress;
    private PaymentMethod paymentMethod;
    private String currency;
    private BigDecimal subtotal;
    private BigDecimal discountTotal;
    private BigDecimal shippingFee;
    private BigDecimal vatRate;
    private BigDecimal vatAmount;
    private BigDecimal grandTotal;
    private Integer itemsCount;
    private List<CartItemResponse> items;
}
