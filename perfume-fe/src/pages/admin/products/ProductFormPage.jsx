import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createProductApi, getProductByIdApi, updateProductApi } from '../../../api/productsApi'
import {
  getBrandsApi,
  getCategoriesApi,
  getCollectionsApi,
  getScentFamiliesApi,
  getTagsApi,
} from '../../../api/filtersApi'

const CONCENTRATIONS = ['EDT', 'EDP', 'PARFUM', 'EAU_FRAICHE', 'OTHER']
const STATUSES = ['ACTIVE', 'HIDDEN', 'OUT_OF_STOCK']

const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const ProductFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])
  const [scentFamilies, setScentFamilies] = useState([])
  const [tags, setTags] = useState([])

  const [form, setForm] = useState({
    name: '',
    slug: '',
    brandId: '',
    categoryId: '',
    collectionId: '',
    scentFamilyId: '',
    concentration: 'EDT',
    status: 'ACTIVE',
    thumbnail: '',
    video: '',
    shortDescription: '',
    description: '',
    topNotes: '',
    heartNotes: '',
    baseNotes: '',
    releaseYear: '',
    imageUrlsText: '',
    tagIds: [],
    variants: [
      {
        volume: '50ml',
        originalPrice: '',
        discountPercent: '',
        stockQuantity: '',
        sku: '',
        sortOrder: 1,
      },
    ],
  })

  const tagIdSet = useMemo(() => new Set(form.tagIds.map(String)), [form.tagIds])

  const handleChange = (key) => (e) => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleToggleTag = (tagId) => {
    setForm((prev) => {
      const next = new Set(prev.tagIds.map(String))
      const key = String(tagId)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return { ...prev, tagIds: Array.from(next).map(Number) }
    })
  }

  const handleChangeVariant = (index, key) => (e) => {
    const value = e.target.value
    setForm((prev) => {
      const next = prev.variants.slice()
      next[index] = { ...next[index], [key]: value }
      return { ...prev, variants: next }
    })
  }

  const handleAddVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          volume: '',
          originalPrice: '',
          discountPercent: '',
          stockQuantity: '',
          sku: '',
          sortOrder: prev.variants.length + 1,
        },
      ],
    }))
  }

  const handleRemoveVariant = (index) => {
    setForm((prev) => {
      const next = prev.variants.slice()
      next.splice(index, 1)
      return { ...prev, variants: next.length ? next : prev.variants }
    })
  }

  const fetchReference = async () => {
    try {
      const [brandsRes, categoriesRes, collectionsRes, scentFamiliesRes, tagsRes] =
        await Promise.all([
          getBrandsApi(),
          getCategoriesApi(),
          getCollectionsApi(),
          getScentFamiliesApi(),
          getTagsApi(),
        ])
      setBrands(Array.isArray(brandsRes) ? brandsRes : [])
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : [])
      setCollections(Array.isArray(collectionsRes) ? collectionsRes : [])
      setScentFamilies(Array.isArray(scentFamiliesRes) ? scentFamiliesRes : [])
      setTags(Array.isArray(tagsRes) ? tagsRes : [])
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || 'Không tải được reference data.')
    }
  }

  const fetchDetail = async () => {
    if (!isEdit) return
    try {
      const p = await getProductByIdApi(id)
      // Comment: map response -> request shape để update dễ
      setForm((prev) => ({
        ...prev,
        name: p?.name || '',
        slug: p?.slug || '',
        brandId: p?.brand?.id ? String(p.brand.id) : '',
        categoryId: p?.category?.id ? String(p.category.id) : '',
        collectionId: p?.collection?.id ? String(p.collection.id) : '',
        scentFamilyId: p?.scentFamily?.id ? String(p.scentFamily.id) : '',
        concentration: p?.concentration || 'EDT',
        status: p?.status || 'ACTIVE',
        thumbnail: p?.thumbnail || '',
        video: p?.video || '',
        shortDescription: p?.shortDescription || '',
        description: p?.description || '',
        topNotes: p?.topNotes || '',
        heartNotes: p?.heartNotes || '',
        baseNotes: p?.baseNotes || '',
        releaseYear: p?.releaseYear ? String(p.releaseYear) : '',
        imageUrlsText: Array.isArray(p?.images) ? p.images.map((i) => i.url).filter(Boolean).join('\n') : '',
        tagIds: Array.isArray(p?.tags) ? p.tags.map((t) => t.id).filter(Boolean) : [],
        variants: Array.isArray(p?.variants)
          ? p.variants
              .slice()
              .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0))
              .map((v) => ({
                volume: v.volume || '',
                originalPrice: v.originalPrice ?? '',
                discountPercent: v.discountPercent ?? '',
                stockQuantity: v.stockQuantity ?? '',
                sku: v.sku || '',
                sortOrder: v.sortOrder ?? 1,
              }))
          : prev.variants,
      }))
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || 'Không tải được chi tiết sản phẩm.')
    }
  }

  useEffect(() => {
    fetchReference()
    fetchDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      const imageUrls = form.imageUrlsText
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean)

      const payload = {
        name: form.name,
        slug: form.slug,
        brandId: Number(form.brandId),
        categoryId: Number(form.categoryId),
        collectionId: toNumberOrNull(form.collectionId),
        scentFamilyId: toNumberOrNull(form.scentFamilyId),
        concentration: form.concentration,
        description: form.description || null,
        shortDescription: form.shortDescription || null,
        topNotes: form.topNotes || null,
        heartNotes: form.heartNotes || null,
        baseNotes: form.baseNotes || null,
        releaseYear: toNumberOrNull(form.releaseYear),
        status: form.status,
        thumbnail: form.thumbnail || null,
        video: form.video || null,
        imageUrls,
        tagIds: form.tagIds,
        variants: form.variants.map((v) => ({
          volume: v.volume,
          originalPrice: toNumberOrNull(v.originalPrice),
          discountPercent: toNumberOrNull(v.discountPercent),
          stockQuantity: toNumberOrNull(v.stockQuantity),
          sku: v.sku || null,
          sortOrder: toNumberOrNull(v.sortOrder) || 1,
        })),
      }

      if (isEdit) await updateProductApi(id, payload)
      else await createProductApi(payload)

      navigate('/admin/products')
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || 'Lưu sản phẩm thất bại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-black">
            {isEdit ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
          </h1>
          <p className="mt-2 text-sm text-black/60">
            Form bám theo schema backend `ProductCreateRequest/ProductUpdateRequest`.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-black bg-white border border-black/10 rounded-full cursor-pointer hover:bg-black/5 transition-colors"
          onClick={() => navigate('/admin/products')}
        >
          Quay lại
        </button>
      </div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-black/5 rounded-2xl space-y-4">
            <h2 className="text-base font-semibold text-black">Thông tin cơ bản</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên *</label>
                <input
                  value={form.name}
                  onChange={handleChange('name')}
                  className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Đường dẫn *</label>
                <input
                  value={form.slug}
                  onChange={handleChange('slug')}
                  className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Thương hiệu *</label>
                <select
                  value={form.brandId}
                  onChange={handleChange('brandId')}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-black/10 rounded-lg outline-none focus:border-black/30 cursor-pointer"
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Danh mục *</label>
                <select
                  value={form.categoryId}
                  onChange={handleChange('categoryId')}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-black/10 rounded-lg outline-none focus:border-black/30 cursor-pointer"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bộ sưu tập</label>
                <select
                  value={form.collectionId}
                  onChange={handleChange('collectionId')}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-black/10 rounded-lg outline-none focus:border-black/30 cursor-pointer"
                >
                  <option value="">Không chọn</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nhóm hương</label>
                <select
                  value={form.scentFamilyId}
                  onChange={handleChange('scentFamilyId')}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-black/10 rounded-lg outline-none focus:border-black/30 cursor-pointer"
                >
                  <option value="">Không chọn</option>
                  {scentFamilies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nồng độ *</label>
                <select
                  value={form.concentration}
                  onChange={handleChange('concentration')}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-black/10 rounded-lg outline-none focus:border-black/30 cursor-pointer"
                >
                  {CONCENTRATIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái *</label>
                <select
                  value={form.status}
                  onChange={handleChange('status')}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-black/10 rounded-lg outline-none focus:border-black/30 cursor-pointer"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Năm ra mắt</label>
                <input
                  value={form.releaseYear}
                  onChange={handleChange('releaseYear')}
                  className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                  placeholder="2004"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ảnh đại diện</label>
              <input
                value={form.thumbnail}
                onChange={handleChange('thumbnail')}
                className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Video (YouTube)</label>
              <input
                value={form.video}
                onChange={handleChange('video')}
                className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          </div>

          <div className="p-6 bg-white border border-black/5 rounded-2xl space-y-4">
            <h2 className="text-base font-semibold text-black">Mô tả & hình ảnh</h2>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả ngắn</label>
              <textarea
                value={form.shortDescription}
                onChange={handleChange('shortDescription')}
                rows={3}
                className="w-full px-4 py-3 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả chi tiết</label>
              <textarea
                value={form.description}
                onChange={handleChange('description')}
                rows={6}
                className="w-full px-4 py-3 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hương đầu</label>
                <textarea
                  value={form.topNotes}
                  onChange={handleChange('topNotes')}
                  rows={3}
                  className="w-full px-4 py-3 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30 resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hương giữa</label>
                <textarea
                  value={form.heartNotes}
                  onChange={handleChange('heartNotes')}
                  rows={3}
                  className="w-full px-4 py-3 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30 resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hương cuối</label>
                <textarea
                  value={form.baseNotes}
                  onChange={handleChange('baseNotes')}
                  rows={3}
                  className="w-full px-4 py-3 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30 resize-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Danh sách ảnh (mỗi dòng 1 URL)</label>
              <textarea
                value={form.imageUrlsText}
                onChange={handleChange('imageUrlsText')}
                rows={5}
                className="w-full px-4 py-3 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-black/5 rounded-2xl">
          <h2 className="text-base font-semibold text-black">Tags</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((t) => {
              const checked = tagIdSet.has(String(t.id))
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`px-3 py-2 text-sm rounded-full border cursor-pointer transition-colors ${
                    checked
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black/10 hover:bg-black/5'
                  }`}
                  onClick={() => handleToggleTag(t.id)}
                >
                  #{t.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-6 bg-white border border-black/5 rounded-2xl">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-black">Biến thể *</h2>
            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-black bg-white border border-black/10 rounded-full cursor-pointer hover:bg-black/5 transition-colors"
              onClick={handleAddVariant}
            >
              + Thêm biến thể
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {form.variants.map((v, idx) => (
              <div key={idx} className="p-4 bg-[#f5f5f5] border border-black/5 rounded-2xl">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-black">Biến thể #{idx + 1}</p>
                  {form.variants.length > 1 ? (
                    <button
                      type="button"
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-black/90 transition-colors"
                      onClick={() => handleRemoveVariant(idx)}
                    >
                      Xóa
                    </button>
                  ) : null}
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-black/60">Dung tích *</label>
                    <input
                      value={v.volume}
                      onChange={handleChangeVariant(idx, 'volume')}
                      className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                      placeholder="50ml"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-black/60">Giá cuối</label>
                    <div className="w-full px-4 py-2.5 text-sm text-black/50 bg-black/5 border border-dashed border-black/10 rounded-lg">
                      Tự động
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-black/60">Giá gốc</label>
                    <input
                      value={v.originalPrice}
                      onChange={handleChangeVariant(idx, 'originalPrice')}
                      className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                      placeholder="2700000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-black/60">Tồn kho *</label>
                    <input
                      value={v.stockQuantity}
                      onChange={handleChangeVariant(idx, 'stockQuantity')}
                      className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                      placeholder="20"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-black/60">Giảm giá %</label>
                    <input
                      value={v.discountPercent}
                      onChange={handleChangeVariant(idx, 'discountPercent')}
                      className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                      placeholder="7"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-black/60">SKU</label>
                    <input
                      value={v.sku}
                      onChange={handleChangeVariant(idx, 'sku')}
                      className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                      placeholder="CHA-AHS-EDT-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-black/60">Thứ tự</label>
                    <input
                      value={v.sortOrder}
                      onChange={handleChangeVariant(idx, 'sortOrder')}
                      className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {errorMessage ? (
          <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-black/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-black bg-white border border-black/10 rounded-full cursor-pointer hover:bg-black/5 transition-colors"
            onClick={() => navigate('/admin/products')}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductFormPage

