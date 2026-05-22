package com.simback.perfume.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Nhóm hương (Oriental, Woody, Fresh, ...).
 * Dùng cho filter và truy xuất sản phẩm theo hương.
 */
@Entity
@Table(name = "scent_families")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScentFamily {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "scent_family_seq")
    @SequenceGenerator(name = "scent_family_seq", sequenceName = "scent_family_sequence", allocationSize = 1)
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
