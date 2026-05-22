package com.simback.perfume.payload.requests;

import com.simback.perfume.model.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusUpdateRequest {
    @NotNull(message = "Trạng thái đơn hàng không được null")
    private OrderStatus status;

    private String adminNote;
}
