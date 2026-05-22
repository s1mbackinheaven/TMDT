package com.simback.perfume.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Biến thể sản phẩm theo dung tích (30ml, 50ml, 100ml).
 * Mỗi variant có giá, tồn kho, đã bán riêng.
 */
@Entity
@Table(name = "product_variants")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_variant_seq")
    @SequenceGenerator(name = "product_variant_seq", sequenceName = "product_variant_sequence", allocationSize = 1)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Product product;

    /** Dung tích hiển thị, VD: "30ml", "100ml" */
    @Column(nullable = false)
    @ToString.Include
    private String volume;

    @Column(nullable = false, precision = 12, scale = 2)
    @ToString.Include
    private BigDecimal price;

    @Column(precision = 12, scale = 2)
    private BigDecimal originalPrice;

    /** Phần trăm giảm giá 0-100 */
    private Integer discountPercent;

    private Integer stockQuantity;

    @Builder.Default
    private Integer soldCount = 0;

    // @Column
    private String sku;

    @Builder.Default
    private Integer sortOrder = 0;
}
