package com.simback.perfume.repository;

import com.simback.perfume.model.CheckoutDraft;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CheckoutDraftRepository extends JpaRepository<CheckoutDraft, Long> {
    Optional<CheckoutDraft> findByDraftNumber(String draftNumber);
}
