package com.simback.perfume.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "cart_items", uniqueConstraints = {
        @UniqueConstraint(name = "uk_cart_variant", columnNames = {"cart_id", "variant_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cart_item_seq")
    @SequenceGenerator(name = "cart_item_seq", sequenceName = "cart_item_sequence", allocationSize = 1)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(name = "product_name_snapshot", nullable = false)
    private String productNameSnapshot;

    @Column(name = "variant_volume_snapshot", nullable = false)
    private String variantVolumeSnapshot;

    @Column(name = "thumbnail_snapshot", length = 1000)
    private String thumbnailSnapshot;

    @Column(name = "unit_price_snapshot", precision = 14, scale = 2, nullable = false)
    private BigDecimal unitPriceSnapshot;

    @Column(name = "original_price_snapshot", precision = 14, scale = 2)
    private BigDecimal originalPriceSnapshot;

    @Column(name = "discount_percent_snapshot")
    private Integer discountPercentSnapshot;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "available_stock_snapshot", nullable = false)
    private Integer availableStockSnapshot;

    @Column(name = "line_subtotal", precision = 14, scale = 2, nullable = false)
    private BigDecimal lineSubtotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CartItemStatus status = CartItemStatus.ACTIVE;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
