package com.simback.perfume.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Bộ sưu tập (Sauvage, La Vie Est Belle, ...).
 * Tách bảng riêng để filter và quản lý.
 */
@Entity
@Table(name = "collections")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Collection {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "collection_seq")
    @SequenceGenerator(name = "collection_seq", sequenceName = "collection_sequence", allocationSize = 1)
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
}
