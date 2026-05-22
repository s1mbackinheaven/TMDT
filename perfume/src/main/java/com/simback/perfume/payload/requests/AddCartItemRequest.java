package com.simback.perfume.payload.requests;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddCartItemRequest {
    @NotNull(message = "Variant id không được null")
    private Long variantId;

    @NotNull(message = "Quantity không được null")
    @Min(value = 1, message = "Quantity phải lớn hơn 0")
    private Integer quantity;
}
