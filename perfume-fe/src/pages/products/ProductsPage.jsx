import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getProductsApi } from '../../api/productsApi'
import {
  getBrandsApi,
  getCategoriesApi,
  getCollectionsApi,
  getScentFamiliesApi,
  getTagsApi,
} from '../../api/filtersApi'
import ProductCard from './components/ProductCard'

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Mặc định' },
  { value: 'name:asc', label: 'Tên A → Z' },
  { value: 'name:desc', label: 'Tên Z → A' },
  { value: 'id:desc', label: 'Mới nhất' },
  { value: 'ratingAvg:desc', label: 'Đánh giá cao' },
  { value: 'reviewCount:desc', label: 'Nhiều đánh giá' },
]

const ProductsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page') || 0)
  const size = Number(searchParams.get('size') || 20)
  const keyword = searchParams.get('keyword') || ''
  const sort = searchParams.get('sort') || 'createdAt:desc'
  const brandId = searchParams.get('brandId') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const collectionId = searchParams.get('collectionId') || ''
  const scentFamilyId = searchParams.get('scentFamilyId') || ''
  const tagIdsParam = searchParams.get('tagIds') || ''
  const tagIds = useMemo(() => {
    return tagIdsParam
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
  }, [tagIdsParam])

  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [filtersError, setFiltersError] = useState('')
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])
  const [scentFamilies, setScentFamilies] = useState([])
  const [tags, setTags] = useState([])
  const [openSection, setOpenSection] = useState('brands')
  const [brandKeyword, setBrandKeyword] = useState('')

  const { sortBy, sortDir } = useMemo(() => {
    const [a, b] = sort.split(':')
    return { sortBy: a || 'createdAt', sortDir: b || 'desc' }
  }, [sort])

  useEffect(() => {
    // Fetch dữ liệu filter sidebar
    const fetchFilters = async () => {
      setFiltersError('')
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
        const message =
          err?.response?.data?.message ||
          'Không tải được bộ lọc. Vui lòng thử lại.'
        setFiltersError(message)
      }
    }

    fetchFilters()
  }, [])

  useEffect(() => {
    // Fetch danh sách sản phẩm theo query params (lean, đúng schema backend)
    const fetchProducts = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const res = await getProductsApi({
          page,
          size,
          sortBy,
          sortDir,
          keyword: keyword || undefined,
          brandId: brandId || undefined,
          categoryId: categoryId || undefined,
          collectionId: collectionId || undefined,
          scentFamilyId: scentFamilyId || undefined,
          tagIds: tagIds.length ? tagIds : undefined,
        })
        setData(res)
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          'Không tải được danh sách sản phẩm. Vui lòng thử lại.'
        setErrorMessage(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [page, size, sortBy, sortDir, keyword, brandId, categoryId, collectionId, scentFamilyId, tagIds])

  const products = data?.content || []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0

  const handleChangeParams = (next) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') params.delete(k)
      else params.set(k, String(v))
    })
    setSearchParams(params)
  }

  const handleToggleSection = (key) => {
    setOpenSection((prev) => (prev === key ? '' : key))
  }

  const handleToggleTag = (id) => {
    const next = new Set(tagIds)
    const key = String(id)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    handleChangeParams({ tagIds: Array.from(next).join(','), page: 0 })
  }

  const filteredBrands = useMemo(() => {
    const q = brandKeyword.trim().toLowerCase()
    if (!q) return brands
    return brands.filter((b) => (b?.name || '').toLowerCase().includes(q))
  }, [brands, brandKeyword])

  const handleGoDetail = (id) => {
    navigate(`/products/${id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="w-full max-w-[1200px] px-4 md:px-10 lg:px-16 mx-auto py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar filter */}
        <aside className="bg-white border border-black/5 rounded-2xl p-5 h-fit">
          <h2 className="text-base font-semibold text-black">Bộ sưu tập nước hoa</h2>

          {filtersError ? (
            <div className="mt-4 px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {filtersError}
            </div>
          ) : null}

          {/* Brands (đặt lên đầu, dạng accordion + scroll để không dài) */}
          <div className="mt-5 border border-black/5 rounded-2xl overflow-hidden">
            <button
              type="button"
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-black cursor-pointer hover:bg-black/5 transition-colors"
              onClick={() => handleToggleSection('brands')}
            >
              <span>Thương hiệu</span>
              <span className="text-black/40">{openSection === 'brands' ? '—' : '+'}</span>
            </button>

            <AnimatePresence initial={false}>
              {openSection === 'brands' ? (
                <motion.div
                  className="px-4 pb-4"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: 'easeOut' }}
                >
                <input
                  value={brandKeyword}
                  onChange={(e) => setBrandKeyword(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                  placeholder="Tìm thương hiệu..."
                />

                <div className="mt-3 max-h-56 overflow-auto pr-1 space-y-2 text-sm text-black/70">
                  <button
                    type="button"
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      !brandId ? 'bg-black text-white' : 'hover:bg-black/5'
                    }`}
                    onClick={() => handleChangeParams({ brandId: '', page: 0 })}
                  >
                    <span>Tất cả</span>
                  </button>

                  {filteredBrands.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        String(b.id) === String(brandId)
                          ? 'bg-black text-white'
                          : 'hover:bg-black/5 text-black/70'
                      }`}
                      onClick={() => handleChangeParams({ brandId: b.id, page: 0 })}
                    >
                      <span className="text-left">{b.name}</span>
                    </button>
                  ))}
                </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Collections */}
          <div className="mt-4 border border-black/5 rounded-2xl overflow-hidden">
            <button
              type="button"
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-black cursor-pointer hover:bg-black/5 transition-colors"
              onClick={() => handleToggleSection('collections')}
            >
              <span>Collection</span>
              <span className="text-black/40">{openSection === 'collections' ? '—' : '+'}</span>
            </button>
            <AnimatePresence initial={false}>
              {openSection === 'collections' ? (
                <motion.div
                  className="px-4 pb-4"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: 'easeOut' }}
                >
                <div className="max-h-44 overflow-auto pr-1 space-y-2 text-sm text-black/70">
                  <button
                    type="button"
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      !collectionId ? 'bg-black text-white' : 'hover:bg-black/5'
                    }`}
                    onClick={() => handleChangeParams({ collectionId: '', page: 0 })}
                  >
                    <span>Tất cả</span>
                  </button>
                  {collections.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        String(c.id) === String(collectionId)
                          ? 'bg-black text-white'
                          : 'hover:bg-black/5 text-black/70'
                      }`}
                      onClick={() => handleChangeParams({ collectionId: c.id, page: 0 })}
                    >
                      <span className="text-left">{c.name}</span>
                    </button>
                  ))}
                </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Categories */}
          <div className="mt-4 border border-black/5 rounded-2xl overflow-hidden">
            <button
              type="button"
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-black cursor-pointer hover:bg-black/5 transition-colors"
              onClick={() => handleToggleSection('categories')}
            >
              <span>Danh mục</span>
              <span className="text-black/40">{openSection === 'categories' ? '—' : '+'}</span>
            </button>
            <AnimatePresence initial={false}>
              {openSection === 'categories' ? (
                <motion.div
                  className="px-4 pb-4"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: 'easeOut' }}
                >
                <div className="max-h-44 overflow-auto pr-1 space-y-2 text-sm text-black/70">
                  <button
                    type="button"
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      !categoryId ? 'bg-black text-white' : 'hover:bg-black/5'
                    }`}
                    onClick={() => handleChangeParams({ categoryId: '', page: 0 })}
                  >
                    <span>Tất cả</span>
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        String(c.id) === String(categoryId)
                          ? 'bg-black text-white'
                          : 'hover:bg-black/5 text-black/70'
                      }`}
                      onClick={() => handleChangeParams({ categoryId: c.id, page: 0 })}
                    >
                      <span className="text-left">{c.name}</span>
                    </button>
                  ))}
                </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Scent families */}
          <div className="mt-4 border border-black/5 rounded-2xl overflow-hidden">
            <button
              type="button"
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-black cursor-pointer hover:bg-black/5 transition-colors"
              onClick={() => handleToggleSection('scentFamilies')}
            >
              <span>Họ mùi</span>
              <span className="text-black/40">{openSection === 'scentFamilies' ? '—' : '+'}</span>
            </button>
            <AnimatePresence initial={false}>
              {openSection === 'scentFamilies' ? (
                <motion.div
                  className="px-4 pb-4"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: 'easeOut' }}
                >
                <div className="max-h-44 overflow-auto pr-1 space-y-2 text-sm text-black/70">
                  <button
                    type="button"
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      !scentFamilyId ? 'bg-black text-white' : 'hover:bg-black/5'
                    }`}
                    onClick={() => handleChangeParams({ scentFamilyId: '', page: 0 })}
                  >
                    <span>Tất cả</span>
                  </button>
                  {scentFamilies.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        String(s.id) === String(scentFamilyId)
                          ? 'bg-black text-white'
                          : 'hover:bg-black/5 text-black/70'
                      }`}
                      onClick={() => handleChangeParams({ scentFamilyId: s.id, page: 0 })}
                    >
                      <span className="text-left">{s.name}</span>
                    </button>
                  ))}
                </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Tags */}
          <div className="mt-4 border border-black/5 rounded-2xl overflow-hidden">
            <button
              type="button"
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-black cursor-pointer hover:bg-black/5 transition-colors"
              onClick={() => handleToggleSection('tags')}
            >
              <span>Tags</span>
              <span className="text-black/40">{openSection === 'tags' ? '—' : '+'}</span>
            </button>
            <AnimatePresence initial={false}>
              {openSection === 'tags' ? (
                <motion.div
                  className="px-4 pb-4"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: 'easeOut' }}
                >
                  <div className="max-h-44 overflow-auto pr-1 space-y-2 text-sm text-black/70">
                    <button
                      type="button"
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        !tagIds.length ? 'bg-black text-white' : 'hover:bg-black/5'
                      }`}
                      onClick={() => handleChangeParams({ tagIds: '', page: 0 })}
                    >
                      <span>Tất cả</span>
                    </button>

                    {tags.map((t) => {
                      const checked = tagIds.includes(String(t.id))
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            checked ? 'bg-black text-white' : 'hover:bg-black/5 text-black/70'
                          }`}
                          onClick={() => handleToggleTag(t.id)}
                        >
                          <span className="text-left">{t.name}</span>
                          <span className={`text-xs font-semibold ${checked ? 'text-white/80' : 'text-black/30'}`}>
                            {checked ? '✓' : ''}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="mt-6 pt-6 border-t border-black/10">
            <h3 className="text-sm font-semibold text-black">Tìm kiếm</h3>
            <input
              value={keyword}
              onChange={(e) => handleChangeParams({ keyword: e.target.value, page: 0 })}
              className="mt-3 w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
              placeholder="Tìm theo tên hoặc slug..."
            />
          </div>
        </aside>

        {/* Main content */}
        <section>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-black/70">
              <span className="font-semibold text-black">
                {totalElements}
              </span>
              <span>kết quả</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-black/60">Sắp xếp</span>
              <select
                value={sort}
                onChange={(e) => handleChangeParams({ sort: e.target.value, page: 0 })}
                className="px-3 py-2 text-sm bg-white border border-black/10 rounded-lg outline-none focus:border-black/30 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8 text-sm text-black/60">Đang tải sản phẩm...</div>
          ) : errorMessage ? (
            <div className="mt-8 px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {errorMessage}
            </div>
          ) : (
            <motion.div
              className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-6"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.06 } },
              }}
            >
              {products.map((p) => (
                <motion.div
                  key={p.id}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
                  }}
                >
                  <ProductCard product={p} onClick={() => handleGoDetail(p.id)} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm">
              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-black/10 cursor-pointer hover:bg-black/5 disabled:opacity-40"
                disabled={page <= 0}
                onClick={() => handleChangeParams({ page: Math.max(0, page - 1) })}
              >
                ‹
              </button>

              <div className="px-4 text-black/70">
                Trang <span className="font-semibold text-black">{page + 1}</span> / {totalPages}
              </div>

              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-black/10 cursor-pointer hover:bg-black/5 disabled:opacity-40"
                disabled={page >= totalPages - 1}
                onClick={() => handleChangeParams({ page: Math.min(totalPages - 1, page + 1) })}
              >
                ›
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

export default ProductsPage

