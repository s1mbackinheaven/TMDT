package com.simback.perfume.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_item_seq")
    @SequenceGenerator(name = "order_item_seq", sequenceName = "order_item_sequence", allocationSize = 1)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(nullable = false)
    private String productNameSnapshot;

    @Column(nullable = false)
    private String variantVolumeSnapshot;

    @Column(length = 1000)
    private String thumbnailSnapshot;

    @Column(name = "unit_price", precision = 14, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "original_price", precision = 14, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "discount_percent")
    private Integer discountPercent;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "line_total", precision = 14, scale = 2, nullable = false)
    private BigDecimal lineTotal;
}
