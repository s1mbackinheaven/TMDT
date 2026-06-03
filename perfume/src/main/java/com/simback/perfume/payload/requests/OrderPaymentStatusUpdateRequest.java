package com.simback.perfume.payload.requests;

import com.simback.perfume.model.OrderPaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderPaymentStatusUpdateRequest {
    @NotNull(message = "Trạng thái thanh toán không được null")
    private OrderPaymentStatus paymentStatus;

    private String adminNote;
}
