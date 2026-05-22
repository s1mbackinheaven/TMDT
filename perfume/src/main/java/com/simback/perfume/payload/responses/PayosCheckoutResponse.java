package com.simback.perfume.payload.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayosCheckoutResponse {
    private Long orderId;
    private String orderNumber;
    private String checkoutUrl;
    private String qrCodeUrl;
    private String transferContent;
    private String message;
}
