package com.simback.perfume.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Ảnh sản phẩm (nhiều ảnh/product, sắp xếp theo sortOrder).
 */
@Entity
@Table(name = "product_images")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_image_seq")
    @SequenceGenerator(name = "product_image_seq", sequenceName = "product_image_sequence", allocationSize = 1)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Product product;

    @Column(nullable = false, length = 1000)
    @ToString.Include
    private String url;

    @Builder.Default
    private Integer sortOrder = 0;
}
