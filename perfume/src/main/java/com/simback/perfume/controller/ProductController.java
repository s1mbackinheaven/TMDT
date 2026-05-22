package com.simback.perfume.controller;

import com.simback.perfume.model.ProductStatus;
import com.simback.perfume.payload.requests.ProductCreateRequest;
import com.simback.perfume.payload.requests.ProductUpdateRequest;
import com.simback.perfume.payload.responses.GeneralAPIResponse;
import com.simback.perfume.payload.responses.ProductListResponse;
import com.simback.perfume.payload.responses.ProductResponse;
import com.simback.perfume.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

/**
 * REST API quản lý sản phẩm: CRUD, list có filter (brand, category, status, keyword).
 */
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Product", description = "API sản phẩm nước hoa")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @Operation(summary = "Tạo sản phẩm mới")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductCreateRequest request) {
        ProductResponse body = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật sản phẩm")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductUpdateRequest request) {
        ProductResponse body = productService.update(id, request);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết sản phẩm theo id")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Lấy chi tiết sản phẩm theo slug (URL thân thiện)")
    public ResponseEntity<ProductResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getBySlug(slug));
    }

    @GetMapping
    @Operation(summary = "Danh sách sản phẩm có phân trang và filter")
    public ResponseEntity<Page<ProductListResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(required = false) String keyword
    ) {
        // Chặn lỗi PropertyReferenceException do client truyền sort dạng JSON/array (vd sort=["1"])
        Set<String> allowedSortFields = Set.of("id", "createdAt", "updatedAt", "name", "ratingAvg", "reviewCount");
        String safeSortBy = allowedSortFields.contains(sortBy) ? sortBy : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 200), Sort.by(direction, safeSortBy));
        Page<ProductListResponse> result = productService.list(pageable, brandId, categoryId, status, keyword);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa sản phẩm")
    public ResponseEntity<GeneralAPIResponse> delete(@PathVariable Long id) {
        productService.deleteById(id);
        return ResponseEntity.ok(GeneralAPIResponse.builder().message("Đã xóa sản phẩm").build());
    }
}
