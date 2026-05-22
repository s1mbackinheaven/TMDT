package com.simback.perfume.payload.requests;

import com.simback.perfume.model.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutPrepareRequest {
    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String shippingAddress;

    @NotBlank(message = "Tên người nhận không được để trống")
    private String recipientName;

    @NotBlank(message = "Số điện thoại người nhận không được để trống")
    private String recipientPhone;

    private String recipientEmail;

    private String note;

    @NotNull(message = "Phương thức thanh toán không được null")
    private PaymentMethod paymentMethod;
}
