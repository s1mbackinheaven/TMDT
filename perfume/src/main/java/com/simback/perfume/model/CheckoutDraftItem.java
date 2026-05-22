package com.simback.perfume.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "checkout_draft_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CheckoutDraftItem {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "checkout_draft_item_seq")
    @SequenceGenerator(name = "checkout_draft_item_seq", sequenceName = "checkout_draft_item_sequence", allocationSize = 1)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "draft_id", nullable = false)
    private CheckoutDraft draft;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private ProductVariant variant;

    @Column(nullable = false)
    private String productNameSnapshot;

    @Column(nullable = false)
    private String variantVolumeSnapshot;

    @Column(name = "unit_price", precision = 14, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "line_total", precision = 14, scale = 2, nullable = false)
    private BigDecimal lineTotal;
}
