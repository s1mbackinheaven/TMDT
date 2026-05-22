package com.simback.perfume.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Sản phẩm nước hoa.
 * Giá/tồn kho theo từng variant (ProductVariant). Rating/review_count derived từ Review.
 */
@Entity
@Table(name = "products")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_seq")
    @SequenceGenerator(name = "product_seq", sequenceName = "product_sequence", allocationSize = 1)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    @Column(nullable = false)
    @ToString.Include
    private String name;

    @Column(unique = true, nullable = false)
    @EqualsAndHashCode.Include
    @ToString.Include
    private String slug;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collection_id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Collection collection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scent_family_id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private ScentFamily scentFamily;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Concentration concentration;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String shortDescription;

    /** Hương đầu */
    @Column(name = "top_notes", columnDefinition = "TEXT")
    private String topNotes;

    /** Hương giữa */
    @Column(name = "heart_notes", columnDefinition = "TEXT")
    private String heartNotes;

    /** Hương cuối */
    @Column(name = "base_notes", columnDefinition = "TEXT")
    private String baseNotes;

    private Integer releaseYear;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(length = 1000)
    private String thumbnail;

    @Column(length = 1000)
    private String video;

    /** Điểm đánh giá trung bình (cập nhật từ Review) */
    @Column(precision = 3, scale = 2)
    private BigDecimal ratingAvg;

    /** Số lượng đánh giá (cập nhật từ Review) */
    private Integer reviewCount;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "product_tags",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
