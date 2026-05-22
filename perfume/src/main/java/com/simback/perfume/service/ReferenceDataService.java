package com.simback.perfume.service;

import com.simback.perfume.payload.requests.*;
import com.simback.perfume.payload.responses.*;

import java.util.List;

/**
 * Service quản lý dữ liệu tham chiếu: Brand, Category, ScentFamily, Collection, Tag.
 * Tạo / cập nhật / xóa / lấy danh sách.
 */
public interface ReferenceDataService {
    // Brand
    BrandDto createBrand(BrandCreateRequest request);
    BrandDto updateBrand(Long id, BrandUpdateRequest request);
    void deleteBrand(Long id);
    List<BrandDto> listBrands();

    // Category
    CategoryDto createCategory(CategoryCreateRequest request);
    CategoryDto updateCategory(Long id, CategoryUpdateRequest request);
    void deleteCategory(Long id);
    List<CategoryDto> listCategories();

    // ScentFamily
    ScentFamilyDto createScentFamily(ScentFamilyCreateRequest request);
    ScentFamilyDto updateScentFamily(Long id, ScentFamilyUpdateRequest request);
    void deleteScentFamily(Long id);
    List<ScentFamilyDto> listScentFamilies();

    // Collection
    CollectionDto createCollection(CollectionCreateRequest request);
    CollectionDto updateCollection(Long id, CollectionUpdateRequest request);
    void deleteCollection(Long id);
    List<CollectionDto> listCollections();

    // Tag
    TagDto createTag(TagCreateRequest request);
    TagDto updateTag(Long id, TagUpdateRequest request);
    void deleteTag(Long id);
    List<TagDto> listTags();
}
