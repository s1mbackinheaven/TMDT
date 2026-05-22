package com.simback.perfume.controller;

import com.simback.perfume.payload.requests.*;
import com.simback.perfume.payload.responses.*;
import com.simback.perfume.service.ReferenceDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API dữ liệu tham chiếu: Brand, Category, ScentFamily, Collection, Tag.
 * GET = danh sách (dropdown). POST = tạo, PUT = cập nhật, DELETE = xóa.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Reference", description = "CRUD thương hiệu, danh mục, nhóm hương, bộ sưu tập, tag")
public class ReferenceDataController {

    private final ReferenceDataService referenceDataService;

    // ---------- Brands ----------
    @GetMapping("/brands")
    @Operation(summary = "Danh sách thương hiệu")
    public ResponseEntity<List<BrandDto>> listBrands() {
        return ResponseEntity.ok(referenceDataService.listBrands());
    }

    @PostMapping("/brands")
    @Operation(summary = "Tạo thương hiệu")
    public ResponseEntity<BrandDto> createBrand(@Valid @RequestBody BrandCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(referenceDataService.createBrand(request));
    }

    @PutMapping("/brands/{id}")
    @Operation(summary = "Cập nhật thương hiệu")
    public ResponseEntity<BrandDto> updateBrand(@PathVariable Long id, @Valid @RequestBody BrandUpdateRequest request) {
        return ResponseEntity.ok(referenceDataService.updateBrand(id, request));
    }

    @DeleteMapping("/brands/{id}")
    @Operation(summary = "Xóa thương hiệu")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        referenceDataService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- Categories ----------
    @GetMapping("/categories")
    @Operation(summary = "Danh sách danh mục (cả cha và con)")
    public ResponseEntity<List<CategoryDto>> listCategories() {
        return ResponseEntity.ok(referenceDataService.listCategories());
    }

    @PostMapping("/categories")
    @Operation(summary = "Tạo danh mục (parentId = null là category cha)")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(referenceDataService.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Cập nhật danh mục")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryUpdateRequest request) {
        return ResponseEntity.ok(referenceDataService.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Xóa danh mục")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        referenceDataService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- Scent families ----------
    @GetMapping("/scent-families")
    @Operation(summary = "Danh sách nhóm hương")
    public ResponseEntity<List<ScentFamilyDto>> listScentFamilies() {
        return ResponseEntity.ok(referenceDataService.listScentFamilies());
    }

    @PostMapping("/scent-families")
    @Operation(summary = "Tạo nhóm hương")
    public ResponseEntity<ScentFamilyDto> createScentFamily(@Valid @RequestBody ScentFamilyCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(referenceDataService.createScentFamily(request));
    }

    @PutMapping("/scent-families/{id}")
    @Operation(summary = "Cập nhật nhóm hương")
    public ResponseEntity<ScentFamilyDto> updateScentFamily(@PathVariable Long id, @Valid @RequestBody ScentFamilyUpdateRequest request) {
        return ResponseEntity.ok(referenceDataService.updateScentFamily(id, request));
    }

    @DeleteMapping("/scent-families/{id}")
    @Operation(summary = "Xóa nhóm hương")
    public ResponseEntity<Void> deleteScentFamily(@PathVariable Long id) {
        referenceDataService.deleteScentFamily(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- Collections ----------
    @GetMapping("/collections")
    @Operation(summary = "Danh sách bộ sưu tập")
    public ResponseEntity<List<CollectionDto>> listCollections() {
        return ResponseEntity.ok(referenceDataService.listCollections());
    }

    @PostMapping("/collections")
    @Operation(summary = "Tạo bộ sưu tập")
    public ResponseEntity<CollectionDto> createCollection(@Valid @RequestBody CollectionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(referenceDataService.createCollection(request));
    }

    @PutMapping("/collections/{id}")
    @Operation(summary = "Cập nhật bộ sưu tập")
    public ResponseEntity<CollectionDto> updateCollection(@PathVariable Long id, @Valid @RequestBody CollectionUpdateRequest request) {
        return ResponseEntity.ok(referenceDataService.updateCollection(id, request));
    }

    @DeleteMapping("/collections/{id}")
    @Operation(summary = "Xóa bộ sưu tập")
    public ResponseEntity<Void> deleteCollection(@PathVariable Long id) {
        referenceDataService.deleteCollection(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- Tags ----------
    @GetMapping("/tags")
    @Operation(summary = "Danh sách tag")
    public ResponseEntity<List<TagDto>> listTags() {
        return ResponseEntity.ok(referenceDataService.listTags());
    }

    @PostMapping("/tags")
    @Operation(summary = "Tạo tag")
    public ResponseEntity<TagDto> createTag(@Valid @RequestBody TagCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(referenceDataService.createTag(request));
    }

    @PutMapping("/tags/{id}")
    @Operation(summary = "Cập nhật tag")
    public ResponseEntity<TagDto> updateTag(@PathVariable Long id, @Valid @RequestBody TagUpdateRequest request) {
        return ResponseEntity.ok(referenceDataService.updateTag(id, request));
    }

    @DeleteMapping("/tags/{id}")
    @Operation(summary = "Xóa tag")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        referenceDataService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }
}
