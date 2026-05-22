package com.simback.perfume.service;

import com.simback.perfume.model.ProductStatus;
import com.simback.perfume.payload.requests.ProductCreateRequest;
import com.simback.perfume.payload.requests.ProductUpdateRequest;
import com.simback.perfume.payload.responses.ProductListResponse;
import com.simback.perfume.payload.responses.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service quản lý sản phẩm: CRUD, list với filter.
 */
public interface ProductService {
    ProductResponse create(ProductCreateRequest request);
    ProductResponse update(Long id, ProductUpdateRequest request);
    ProductResponse getById(Long id);
    ProductResponse getBySlug(String slug);
    Page<ProductListResponse> list(Pageable pageable, Long brandId, Long categoryId, ProductStatus status, String keyword);
    void deleteById(Long id);
}
