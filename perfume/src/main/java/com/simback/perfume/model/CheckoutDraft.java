package com.simback.perfume.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "checkout_drafts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CheckoutDraft {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "checkout_draft_seq")
    @SequenceGenerator(name = "checkout_draft_seq", sequenceName = "checkout_draft_sequence", allocationSize = 1)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(unique = true, nullable = false)
    private String draftNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CheckoutStatus status;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "VND";

    @Column(name = "subtotal", precision = 14, scale = 2, nullable = false)
    private BigDecimal subtotal;

    @Column(name = "vat_rate", precision = 5, scale = 2, nullable = false)
    private BigDecimal vatRate;

    @Column(name = "vat_amount", precision = 14, scale = 2, nullable = false)
    private BigDecimal vatAmount;

    @Column(name = "shipping_fee", precision = 14, scale = 2, nullable = false)
    private BigDecimal shippingFee;

    @Column(name = "discount_total", precision = 14, scale = 2, nullable = false)
    private BigDecimal discountTotal;

    @Column(name = "grand_total", precision = 14, scale = 2, nullable = false)
    private BigDecimal grandTotal;

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(name = "recipient_phone")
    private String recipientPhone;

    @Column(name = "recipient_email")
    private String recipientEmail;

    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "draft", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CheckoutDraftItem> items = new ArrayList<>();

    @PrePersist
    void onCreate() { createdAt = Instant.now(); updatedAt = Instant.now(); }
    @PreUpdate
    void onUpdate() { updatedAt = Instant.now(); }
}
