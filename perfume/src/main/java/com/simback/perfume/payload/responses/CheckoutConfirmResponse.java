package com.simback.perfume.payload.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutConfirmResponse {
    private String message;
    private String draftNumber;
    private String orderNumber;
}
