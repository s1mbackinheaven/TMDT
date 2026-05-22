package com.simback.perfume.payload.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayosWebhookResponse {
    private String message;
    private Long orderId;
    private String orderNumber;
    private String status;
}
