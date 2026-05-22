package com.simback.perfume.repository;

import com.simback.perfume.model.ScentFamily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/** Repository nhóm hương. */
@Repository
public interface ScentFamilyRepository extends JpaRepository<ScentFamily, Long> {
    Optional<ScentFamily> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
