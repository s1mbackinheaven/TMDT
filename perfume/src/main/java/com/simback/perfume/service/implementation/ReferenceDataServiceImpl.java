package com.simback.perfume.service.implementation;

import com.simback.perfume.exception.ResourceNotFoundException;
import com.simback.perfume.model.*;
import com.simback.perfume.payload.requests.*;
import com.simback.perfume.payload.responses.*;
import com.simback.perfume.repository.*;
import com.simback.perfume.service.ReferenceDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation: CRUD cho Brand, Category, ScentFamily, Collection, Tag.
 * Slug trống khi tạo sẽ tự sinh từ name (chữ thường, dấu cách -> gạch ngang).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReferenceDataServiceImpl implements ReferenceDataService {

    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ScentFamilyRepository scentFamilyRepository;
    private final CollectionRepository collectionRepository;
    private final TagRepository tagRepository;

    private static String slugify(String name) {
        if (name == null || name.isBlank()) return "";
        return name.trim().toLowerCase()
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("đ", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s-]+", "-")
                .replaceAll("^-|-$", "");
    }

    private static String ensureSlug(String slug, String name) {
        return (slug != null && !slug.isBlank()) ? slug.trim() : slugify(name);
    }

    @Override
    @Transactional
    public BrandDto createBrand(BrandCreateRequest request) {
        String slug = ensureSlug(request.getSlug(), request.getName());
        if (brandRepository.existsBySlug(slug)) throw new IllegalArgumentException("Slug thương hiệu đã tồn tại: " + slug);
        Brand b = Brand.builder().name(request.getName().trim()).slug(slug).build();
        b = brandRepository.save(b);
        log.info("Tạo thương hiệu id={}, slug={}", b.getId(), b.getSlug());
        return toBrandDto(b);
    }

    @Override
    @Transactional
    public BrandDto updateBrand(Long id, BrandUpdateRequest request) {
        Brand b = brandRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu id: " + id));
        if (!b.getSlug().equals(request.getSlug()) && brandRepository.existsBySlug(request.getSlug()))
            throw new IllegalArgumentException("Slug thương hiệu đã tồn tại: " + request.getSlug());
        b.setName(request.getName().trim());
        b.setSlug(request.getSlug().trim());
        brandRepository.save(b);
        return toBrandDto(b);
    }

    @Override
    @Transactional
    public void deleteBrand(Long id) {
        Brand b = brandRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu id: " + id));
        brandRepository.delete(b);
        log.info("Đã xóa thương hiệu id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandDto> listBrands() {
        return brandRepository.findAll().stream().map(this::toBrandDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryDto createCategory(CategoryCreateRequest request) {
        String slug = ensureSlug(request.getSlug(), request.getName());
        if (categoryRepository.existsBySlug(slug)) throw new IllegalArgumentException("Slug danh mục đã tồn tại: " + slug);
        Category parent = request.getParentId() != null
                ? categoryRepository.findById(request.getParentId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục cha id: " + request.getParentId()))
                : null;
        Category c = Category.builder().name(request.getName().trim()).slug(slug).parent(parent).build();
        c = categoryRepository.save(c);
        log.info("Tạo danh mục id={}, slug={}", c.getId(), c.getSlug());
        return toCategoryDto(c);
    }

    @Override
    @Transactional
    public CategoryDto updateCategory(Long id, CategoryUpdateRequest request) {
        Category c = categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục id: " + id));
        if (!c.getSlug().equals(request.getSlug()) && categoryRepository.existsBySlug(request.getSlug()))
            throw new IllegalArgumentException("Slug danh mục đã tồn tại: " + request.getSlug());
        Category parent = request.getParentId() != null
                ? categoryRepository.findById(request.getParentId()).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục cha id: " + request.getParentId()))
                : null;
        c.setName(request.getName().trim());
        c.setSlug(request.getSlug().trim());
        c.setParent(parent);
        categoryRepository.save(c);
        return toCategoryDto(c);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category c = categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục id: " + id));
        categoryRepository.delete(c);
        log.info("Đã xóa danh mục id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> listCategories() {
        return categoryRepository.findAll().stream().map(this::toCategoryDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ScentFamilyDto createScentFamily(ScentFamilyCreateRequest request) {
        String slug = ensureSlug(request.getSlug(), request.getName());
        if (scentFamilyRepository.existsBySlug(slug)) throw new IllegalArgumentException("Slug nhóm hương đã tồn tại: " + slug);
        ScentFamily s = ScentFamily.builder().name(request.getName().trim()).slug(slug).build();
        s = scentFamilyRepository.save(s);
        log.info("Tạo nhóm hương id={}, slug={}", s.getId(), s.getSlug());
        return toScentFamilyDto(s);
    }

    @Override
    @Transactional
    public ScentFamilyDto updateScentFamily(Long id, ScentFamilyUpdateRequest request) {
        ScentFamily s = scentFamilyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhóm hương id: " + id));
        if (!s.getSlug().equals(request.getSlug()) && scentFamilyRepository.existsBySlug(request.getSlug()))
            throw new IllegalArgumentException("Slug nhóm hương đã tồn tại: " + request.getSlug());
        s.setName(request.getName().trim());
        s.setSlug(request.getSlug().trim());
        scentFamilyRepository.save(s);
        return toScentFamilyDto(s);
    }

    @Override
    @Transactional
    public void deleteScentFamily(Long id) {
        ScentFamily s = scentFamilyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhóm hương id: " + id));
        scentFamilyRepository.delete(s);
        log.info("Đã xóa nhóm hương id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScentFamilyDto> listScentFamilies() {
        return scentFamilyRepository.findAll().stream().map(this::toScentFamilyDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CollectionDto createCollection(CollectionCreateRequest request) {
        String slug = ensureSlug(request.getSlug(), request.getName());
        if (collectionRepository.existsBySlug(slug)) throw new IllegalArgumentException("Slug bộ sưu tập đã tồn tại: " + slug);
        Collection c = Collection.builder().name(request.getName().trim()).slug(slug).build();
        c = collectionRepository.save(c);
        log.info("Tạo bộ sưu tập id={}, slug={}", c.getId(), c.getSlug());
        return toCollectionDto(c);
    }

    @Override
    @Transactional
    public CollectionDto updateCollection(Long id, CollectionUpdateRequest request) {
        Collection c = collectionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ sưu tập id: " + id));
        if (!c.getSlug().equals(request.getSlug()) && collectionRepository.existsBySlug(request.getSlug()))
            throw new IllegalArgumentException("Slug bộ sưu tập đã tồn tại: " + request.getSlug());
        c.setName(request.getName().trim());
        c.setSlug(request.getSlug().trim());
        collectionRepository.save(c);
        return toCollectionDto(c);
    }

    @Override
    @Transactional
    public void deleteCollection(Long id) {
        Collection c = collectionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ sưu tập id: " + id));
        collectionRepository.delete(c);
        log.info("Đã xóa bộ sưu tập id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CollectionDto> listCollections() {
        return collectionRepository.findAll().stream().map(this::toCollectionDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TagDto createTag(TagCreateRequest request) {
        String slug = ensureSlug(request.getSlug(), request.getName());
        if (tagRepository.existsBySlug(slug)) throw new IllegalArgumentException("Slug tag đã tồn tại: " + slug);
        Tag t = Tag.builder().name(request.getName().trim()).slug(slug).build();
        t = tagRepository.save(t);
        log.info("Tạo tag id={}, slug={}", t.getId(), t.getSlug());
        return toTagDto(t);
    }

    @Override
    @Transactional
    public TagDto updateTag(Long id, TagUpdateRequest request) {
        Tag t = tagRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tag id: " + id));
        if (!t.getSlug().equals(request.getSlug()) && tagRepository.existsBySlug(request.getSlug()))
            throw new IllegalArgumentException("Slug tag đã tồn tại: " + request.getSlug());
        t.setName(request.getName().trim());
        t.setSlug(request.getSlug().trim());
        tagRepository.save(t);
        return toTagDto(t);
    }

    @Override
    @Transactional
    public void deleteTag(Long id) {
        Tag t = tagRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tag id: " + id));
        tagRepository.delete(t);
        log.info("Đã xóa tag id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TagDto> listTags() {
        return tagRepository.findAll().stream().map(this::toTagDto).collect(Collectors.toList());
    }

    private BrandDto toBrandDto(Brand b) {
        return BrandDto.builder().id(b.getId()).name(b.getName()).slug(b.getSlug()).build();
    }

    private CategoryDto toCategoryDto(Category c) {
        return CategoryDto.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .build();
    }

    private ScentFamilyDto toScentFamilyDto(ScentFamily s) {
        return ScentFamilyDto.builder().id(s.getId()).name(s.getName()).slug(s.getSlug()).build();
    }

    private CollectionDto toCollectionDto(Collection c) {
        return CollectionDto.builder().id(c.getId()).name(c.getName()).slug(c.getSlug()).build();
    }

    private TagDto toTagDto(Tag t) {
        return TagDto.builder().id(t.getId()).name(t.getName()).slug(t.getSlug()).build();
    }
}
