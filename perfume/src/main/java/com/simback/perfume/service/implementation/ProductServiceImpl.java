package com.simback.perfume.service.implementation;

import com.simback.perfume.exception.ResourceNotFoundException;
import com.simback.perfume.model.*;
import com.simback.perfume.model.Collection;
import com.simback.perfume.payload.requests.ProductCreateRequest;
import com.simback.perfume.payload.requests.ProductUpdateRequest;
import com.simback.perfume.payload.responses.*;
import com.simback.perfume.repository.*;
import com.simback.perfume.service.ProductService;
import com.simback.perfume.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation ProductService: tạo/cập nhật/xóa sản phẩm, list có filter, map
 * entity <-> DTO.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final CollectionRepository collectionRepository;
    private final ScentFamilyRepository scentFamilyRepository;
    private final TagRepository tagRepository;

    @Override
    @Transactional
    public ProductResponse create(ProductCreateRequest request) {
        // Load và validate các tham chiếu
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy thương hiệu id: " + request.getBrandId()));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy danh mục id: " + request.getCategoryId()));
        Collection collection = request.getCollectionId() != null
                ? collectionRepository.findById(request.getCollectionId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Không tìm thấy bộ sưu tập id: " + request.getCollectionId()))
                : null;
        ScentFamily scentFamily = request.getScentFamilyId() != null
                ? scentFamilyRepository.findById(request.getScentFamilyId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Không tìm thấy nhóm hương id: " + request.getScentFamilyId()))
                : null;

        if (productRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Slug đã tồn tại: " + request.getSlug());
        }

        Product product = Product.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .brand(brand)
                .category(category)
                .collection(collection)
                .scentFamily(scentFamily)
                .concentration(request.getConcentration())
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .topNotes(request.getTopNotes())
                .heartNotes(request.getHeartNotes())
                .baseNotes(request.getBaseNotes())
                .releaseYear(request.getReleaseYear())
                .status(request.getStatus())
                .thumbnail(request.getThumbnail())
                .video(request.getVideo())
                .ratingAvg(null)
                .reviewCount(0)
                .build();

        product = productRepository.save(product);

        // Thêm variants
        int so = 0;
        for (ProductCreateRequest.ProductVariantRequest vr : request.getVariants()) {
            ProductVariant v = ProductVariant.builder()
                    .product(product)
                    .volume(vr.getVolume())
                    .originalPrice(resolveOriginalPrice(vr))
                    .discountPercent(normalizeDiscountPercent(vr.getDiscountPercent()))
                    .price(resolveFinalPrice(vr))
                    .stockQuantity(vr.getStockQuantity() != null ? vr.getStockQuantity() : 0)
                    .soldCount(0)
                    .sku(vr.getSku())
                    .sortOrder(vr.getSortOrder() != null ? vr.getSortOrder() : so++)
                    .build();
            product.getVariants().add(v);
        }

        // Thêm ảnh
        if (request.getImageUrls() != null) {
            int order = 0;
            for (String url : request.getImageUrls()) {
                if (url == null || url.isBlank())
                    continue;
                ProductImage img = ProductImage.builder()
                        .product(product)
                        .url(url.trim())
                        .sortOrder(order++)
                        .build();
                product.getImages().add(img);
            }
        }

        // Gán tags
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            Set<Tag> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));
            product.setTags(tags);
        }

        productRepository.save(product);
        log.info("Tạo sản phẩm id={}, slug={}", product.getId(), product.getSlug());
        return toProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + id));

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy thương hiệu id: " + request.getBrandId()));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy danh mục id: " + request.getCategoryId()));
        Collection collection = request.getCollectionId() != null
                ? collectionRepository.findById(request.getCollectionId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Không tìm thấy bộ sưu tập id: " + request.getCollectionId()))
                : null;
        ScentFamily scentFamily = request.getScentFamilyId() != null
                ? scentFamilyRepository.findById(request.getScentFamilyId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Không tìm thấy nhóm hương id: " + request.getScentFamilyId()))
                : null;

        if (!product.getSlug().equals(request.getSlug()) && productRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Slug đã tồn tại: " + request.getSlug());
        }

        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setBrand(brand);
        product.setCategory(category);
        product.setCollection(collection);
        product.setScentFamily(scentFamily);
        product.setConcentration(request.getConcentration());
        product.setDescription(request.getDescription());
        product.setShortDescription(request.getShortDescription());
        product.setTopNotes(request.getTopNotes());
        product.setHeartNotes(request.getHeartNotes());
        product.setBaseNotes(request.getBaseNotes());
        product.setReleaseYear(request.getReleaseYear());
        product.setStatus(request.getStatus());
        product.setThumbnail(request.getThumbnail());
        product.setVideo(request.getVideo());

        // Replace variants: xóa hết rồi thêm lại theo request
        product.getVariants().clear();
        if (request.getVariants() != null) {
            int so = 0;
            for (ProductCreateRequest.ProductVariantRequest vr : request.getVariants()) {
                ProductVariant v = ProductVariant.builder()
                        .product(product)
                        .volume(vr.getVolume())
                        .originalPrice(resolveOriginalPrice(vr))
                        .discountPercent(normalizeDiscountPercent(vr.getDiscountPercent()))
                        .price(resolveFinalPrice(vr))
                        .stockQuantity(vr.getStockQuantity() != null ? vr.getStockQuantity() : 0)
                        .soldCount(0)
                        .sku(vr.getSku())
                        .sortOrder(vr.getSortOrder() != null ? vr.getSortOrder() : so++)
                        .build();
                //applyAutoDiscountPrice(v);
                product.getVariants().add(v);
            }
        }

        // Replace images
        product.getImages().clear();
        if (request.getImageUrls() != null) {
            int order = 0;
            for (String url : request.getImageUrls()) {
                if (url == null || url.isBlank())
                    continue;
                ProductImage img = ProductImage.builder()
                        .product(product)
                        .url(url.trim())
                        .sortOrder(order++)
                        .build();
                product.getImages().add(img);
            }
        }

        // Replace tags
        product.getTags().clear();
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            product.setTags(new HashSet<>(tagRepository.findAllById(request.getTagIds())));
        }

        productRepository.save(product);
        log.info("Cập nhật sản phẩm id={}", id);
        return toProductResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + id));
        return toProductResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm slug: " + slug));
        return toProductResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductListResponse> list(Pageable pageable, Long brandId, Long categoryId, ProductStatus status,
            String keyword) {
        Specification<Product> spec = ProductSpecification.filter(brandId, categoryId, status, keyword);
        Page<Product> page = productRepository.findAll(spec, pageable);
        return page.map(this::toProductListResponse);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + id));
        productRepository.delete(product);
        log.info("Đã xóa sản phẩm id={}", id);
    }

    private ProductResponse toProductResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .brand(toBrandDto(p.getBrand()))
                .category(toCategoryDto(p.getCategory()))
                .collection(p.getCollection() != null ? toCollectionDto(p.getCollection()) : null)
                .scentFamily(p.getScentFamily() != null ? toScentFamilyDto(p.getScentFamily()) : null)
                .concentration(p.getConcentration())
                .description(p.getDescription())
                .shortDescription(p.getShortDescription())
                .topNotes(p.getTopNotes())
                .heartNotes(p.getHeartNotes())
                .baseNotes(p.getBaseNotes())
                .releaseYear(p.getReleaseYear())
                .status(p.getStatus())
                .thumbnail(p.getThumbnail())
                .video(p.getVideo())
                .ratingAvg(p.getRatingAvg())
                .reviewCount(p.getReviewCount() != null ? p.getReviewCount() : 0)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .variants(p.getVariants().stream().map(this::toVariantDto).collect(Collectors.toList()))
                .images(p.getImages().stream().map(this::toImageDto).collect(Collectors.toList()))
                .tags(p.getTags().stream().map(this::toTagDto).collect(Collectors.toList()))
                .build();
    }

    private ProductListResponse toProductListResponse(Product p) {
        BigDecimal minPrice = p.getVariants().stream()
                .map(ProductVariant::getPrice)
                .filter(Objects::nonNull)
                .min(BigDecimal::compareTo)
                .orElse(null);
        return ProductListResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .thumbnail(p.getThumbnail())
                .brandName(p.getBrand().getName())
                .categoryName(p.getCategory().getName())
                .minPrice(minPrice)
                .ratingAvg(p.getRatingAvg())
                .reviewCount(p.getReviewCount() != null ? p.getReviewCount() : 0)
                .status(p.getStatus())
                .build();
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

    private CollectionDto toCollectionDto(Collection c) {
        return CollectionDto.builder().id(c.getId()).name(c.getName()).slug(c.getSlug()).build();
    }

    private ScentFamilyDto toScentFamilyDto(ScentFamily s) {
        return ScentFamilyDto.builder().id(s.getId()).name(s.getName()).slug(s.getSlug()).build();
    }

    private ProductVariantDto toVariantDto(ProductVariant v) {
        return ProductVariantDto.builder()
                .id(v.getId())
                .volume(v.getVolume())
                .price(v.getPrice())
                .originalPrice(v.getOriginalPrice())
                .discountPercent(v.getDiscountPercent())
                .stockQuantity(v.getStockQuantity())
                .soldCount(v.getSoldCount() != null ? v.getSoldCount() : 0)
                .sku(v.getSku())
                .sortOrder(v.getSortOrder() != null ? v.getSortOrder() : 0)
                .build();
    }

    private BigDecimal resolveOriginalPrice(ProductCreateRequest.ProductVariantRequest vr) {
        if (vr.getOriginalPrice() != null) {
            return vr.getOriginalPrice();
        }
        return vr.getPrice();
    }

    private BigDecimal resolveFinalPrice(ProductCreateRequest.ProductVariantRequest vr) {
        BigDecimal basePrice = resolveOriginalPrice(vr);
        Integer discountPercent = normalizeDiscountPercent(vr.getDiscountPercent());
        if (basePrice == null) {
            return null;
        }
        if (discountPercent == null || discountPercent <= 0) {
            return basePrice;
        }
        BigDecimal discountFactor = BigDecimal.valueOf(100 - discountPercent)
                .divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);
        return basePrice.multiply(discountFactor).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private Integer normalizeDiscountPercent(Integer discountPercent) {
        if (discountPercent == null) {
            return null;
        }
        if (discountPercent < 0) {
            return 0;
        }
        if (discountPercent > 100) {
            return 100;
        }
        return discountPercent;
    }

    private ProductImageDto toImageDto(ProductImage i) {
        return ProductImageDto.builder()
                .id(i.getId())
                .url(i.getUrl())
                .sortOrder(i.getSortOrder() != null ? i.getSortOrder() : 0)
                .build();
    }

    private TagDto toTagDto(Tag t) {
        return TagDto.builder().id(t.getId()).name(t.getName()).slug(t.getSlug()).build();
    }
}
