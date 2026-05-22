package com.simback.perfume.payload.requests;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCartItemRequest {
    @Min(value = 1, message = "Quantity phải lớn hơn 0")
    private Integer quantity;

    private Long variantId;
}
