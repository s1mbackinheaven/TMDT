import { useEffect, useMemo, useState } from 'react'
import { FiBookmark, FiGrid, FiLayers, FiTag } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { getProductByIdApi } from '../../api/productsApi'
import { addCartItemApi } from '../../api/cartApi'
import { useToast } from '../../contexts/ToastContext'
import ProductGallery from './components/ProductGallery'

const formatVnd = (value) => {
  if (value === null || value === undefined) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ'
}

const toYoutubeEmbedUrl = (url) => {
  if (!url) return ''
  try {
    const u = new URL(url)
    const host = u.hostname.replace('www.', '')

    if (host === 'youtu.be') {
      const id = u.pathname.replace('/', '')
      return id ? `https://www.youtube.com/embed/${id}` : ''
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname === '/watch') {
        const id = u.searchParams.get('v')
        return id ? `https://www.youtube.com/embed/${id}` : ''
      }
      if (u.pathname.startsWith('/embed/')) return url
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.split('/shorts/')[1]?.split('?')?.[0]
        return id ? `https://www.youtube.com/embed/${id}` : ''
      }
    }

    return ''
  } catch {
    return ''
  }
}

const ProductDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { pushToast } = useToast()

  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeVariantId, setActiveVariantId] = useState(null)
  const [quantity, setQuantity] = useState('1')

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const res = await getProductByIdApi(id)
        setProduct(res)
        const firstVariant = res?.variants?.slice?.().sort?.((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0))?.[0]
        setActiveVariantId(firstVariant?.id ?? null)
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          'Không tải được chi tiết sản phẩm. Vui lòng thử lại.'
        setErrorMessage(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetail()
  }, [id])

  const variants = useMemo(() => {
    const list = Array.isArray(product?.variants) ? product.variants : []
    return list.slice().sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0))
  }, [product])

  const activeVariant = useMemo(() => {
    return variants.find((v) => v.id === activeVariantId) || variants[0] || null
  }, [variants, activeVariantId])

  const chips = useMemo(() => {
    const list = []

    if (product?.brand?.name) {
      list.push({ key: 'brand', label: 'Brand', value: product.brand.name, Icon: FiBookmark })
    }
    if (product?.category?.name) {
      list.push({ key: 'category', label: 'Category', value: product.category.name, Icon: FiGrid })
    }
    if (product?.collection?.name) {
      list.push({ key: 'collection', label: 'Collection', value: product.collection.name, Icon: FiLayers })
    }
    if (product?.scentFamily?.name) {
      list.push({ key: 'scentFamily', label: 'Scent family', value: product.scentFamily.name, Icon: FiTag })
    }

    return list
  }, [product])

  const tagChips = useMemo(() => {
    const list = Array.isArray(product?.tags) ? product.tags : []
    return list.filter((t) => t?.name)
  }, [product])

  const youtubeEmbedUrl = useMemo(() => {
    return toYoutubeEmbedUrl(product?.video)
  }, [product])

  const handleBackToList = () => {
    navigate('/products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentStock = Number(activeVariant?.stockQuantity || 0)

  const handleChangeQuantity = (value) => {
    if (value === '') {
      setQuantity('')
      return
    }
    if (!/^\d+$/.test(value)) return
    const next = Number(value)
    if (currentStock && next > currentStock) {
      pushToast(`Số lượng tối đa cho dung tích này là ${currentStock}.`, 'error')
      return
    }
    setQuantity(value)
  }

  const handleDecreaseQuantity = () => {
    const current = quantity === '' ? 0 : Number(quantity)
    if (!Number.isFinite(current) || current <= 1) return
    setQuantity(String(current - 1))
  }

  const handleIncreaseQuantity = () => {
    const current = quantity === '' ? 0 : Number(quantity)
    if (!Number.isFinite(current)) return
    if (currentStock && current >= currentStock) {
      pushToast(`Số lượng tối đa cho dung tích này là ${currentStock}.`, 'error')
      return
    }
    setQuantity(String(current + 1))
  }

  const handleQuantityBlur = () => {
    if (quantity === '') {
      setQuantity('1')
      return
    }
    const next = Math.max(1, Number(quantity) || 1)
    if (currentStock && next > currentStock) {
      setQuantity(String(currentStock))
      pushToast(`Số lượng tối đa cho dung tích này là ${currentStock}.`, 'error')
      return
    }
    setQuantity(String(next))
  }

  const handleQuantityKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur()
    }
  }

  const handleAddToCart = async () => {
    const qty = Math.max(1, Number(quantity) || 1)
    if (!activeVariant?.id) return
    if (currentStock && qty > currentStock) {
      pushToast(`Số lượng tối đa cho dung tích này là ${currentStock}.`, 'error')
      return
    }
    try {
      await addCartItemApi({ productId: product.id, variantId: activeVariant.id, quantity: qty })
      pushToast(`Đã thêm ${product.name} (${activeVariant.volume}) x${qty} vào giỏ hàng.`)
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || 'Không thêm được vào giỏ hàng.')
    }
  }

  if (isLoading) {
    return <div className="w-full max-w-[1200px] px-4 md:px-10 lg:px-16 mx-auto py-10 text-sm text-black/60">Đang tải chi tiết...</div>
  }

  if (errorMessage) {
    return (
      <div className="w-full max-w-[1200px] px-4 md:px-10 lg:px-16 mx-auto py-10">
        <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
          {errorMessage}
        </div>
        <button
          type="button"
          className="mt-4 inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-black/90 transition-colors"
          onClick={handleBackToList}
        >
          Quay lại danh sách
        </button>
      </div>
    )
  }

  if (!product) return null

  return (
    <motion.div
      className="w-full max-w-[1200px] px-4 md:px-10 lg:px-16 mx-auto py-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <motion.button
        type="button"
        className="text-sm text-black/70 cursor-pointer hover:text-black transition-colors"
        onClick={handleBackToList}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        ‹ Quay lại
      </motion.button>

      <motion.div
        className="mt-6 grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-10"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 1 },
          show: { opacity: 1, transition: { staggerChildren: 0.12 } },
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
          }}
        >
          <ProductGallery images={product.images} thumbnail={product.thumbnail} name={product.name} />
        </motion.div>

        <motion.div
          className="min-w-0"
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
          }}
        >
          <motion.h1
            className="text-2xl md:text-3xl font-semibold text-black"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.08 }}
          >
            {product.name}
          </motion.h1>

          <motion.div
            className="mt-4 flex items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.12 }}
          >
            <p className="text-2xl font-semibold text-black">
              {formatVnd(activeVariant?.price)}
            </p>
            {activeVariant?.originalPrice ? (
              <p className="text-sm text-black/40 line-through">
                {formatVnd(activeVariant.originalPrice)}
              </p>
            ) : null}
            {activeVariant?.discountPercent ? (
              <span className="px-2.5 py-1 text-xs font-semibold text-white bg-black rounded-full">
                -{activeVariant.discountPercent}%
              </span>
            ) : null}
          </motion.div>

          <motion.p
            className="mt-4 text-sm text-black/70 leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.16 }}
          >
            {product.shortDescription || product.description}
          </motion.p>

          {/* Chip thông tin (ẩn item không có dữ liệu) */}
          {chips.length ? (
            <motion.div
              className="mt-5 flex flex-wrap items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.2 }}
            >
              {chips.map(({ key, label, value, Icon }) => (
                <div
                  key={key}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-black/10 rounded-full"
                >
                  <Icon size={14} className="text-black/60" />
                  <span className="text-black/50">{label}:</span>
                  <span className="font-semibold text-black whitespace-nowrap">
                    {value}
                  </span>
                </div>
              ))}
            </motion.div>
          ) : null}

          {/* Tags */}
          {tagChips.length ? (
            <motion.div
              className="mt-3 flex flex-wrap items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.24 }}
            >
              {tagChips.map((t) => (
                <span
                  key={t.id || t.slug || t.name}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-black/70 bg-[#f5f5f5] border border-black/5 rounded-full"
                >
                  #{t.name}
                </span>
              ))}
            </motion.div>
          ) : null}

          {/* Variant chọn dung tích */}
          {variants.length ? (
            <div className="mt-6">
              <p className="text-sm font-semibold text-black">Dung tích</p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {variants.map((v) => {
                  const selected = v.id === activeVariant?.id
                  const stock = Number(v.stockQuantity || 0)
                  return (
                    <button
                      key={v.id}
                      type="button"
                      className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? 'border-black bg-black text-white shadow-sm'
                          : 'border-black/10 bg-white text-black hover:border-black/20 hover:bg-black/[0.03]'
                      }`}
                      onClick={() => setActiveVariantId(v.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className={`text-sm font-semibold ${selected ? 'text-white' : 'text-black'}`}>{v.volume}</div>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium ${selected ? 'bg-white/15 text-white' : 'bg-black/5 text-black/60'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {stock > 0 ? `Còn ${stock}` : 'Hết hàng'}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-5">
            {/* Số lượng */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-semibold text-black/60">Số lượng:</span>
              <div className="inline-flex items-center gap-2 px-2 py-1.5 bg-white border border-black/10 rounded-full">
                <button
                  type="button"
                  className="flex items-center justify-center w-9 h-9 text-base text-black bg-black/5 rounded-full cursor-pointer hover:bg-black/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={handleDecreaseQuantity}
                  aria-label="decrease-quantity"
                  disabled={Number(quantity || 1) <= 1}
                >
                  −
                </button>

                <input
                  value={quantity}
                  onChange={(e) => handleChangeQuantity(e.target.value)}
                  onBlur={handleQuantityBlur}
                  onKeyDown={handleQuantityKeyDown}
                  inputMode="numeric"
                  placeholder="1"
                  className="w-12 text-center text-sm font-semibold text-black bg-transparent outline-none"
                />

                <button
                  type="button"
                  className="flex items-center justify-center w-9 h-9 text-base text-black bg-black/5 rounded-full cursor-pointer hover:bg-black/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={handleIncreaseQuantity}
                  aria-label="increase-quantity"
                  disabled={currentStock ? Number(quantity || 1) >= currentStock : false}
                >
                  +
                </button>
              </div>
              {currentStock ? (
                <p className="text-xs text-black/45">Tối đa {currentStock} sản phẩm cho dung tích đang chọn</p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-black/90 transition-colors"
              onClick={async () => {
                try {
                  const qty = Math.max(1, Number(quantity) || 1)
                  await addCartItemApi({ productId: product.id, variantId: activeVariant.id, quantity: qty })
                  navigate('/checkout', {
                    state: {
                      cart: {
                        items: [
                          {
                            id: `buy-now-${product.id}-${activeVariant.id}`,
                            productId: product.id,
                            variantId: activeVariant.id,
                            productName: product.name,
                            variantVolume: activeVariant.volume,
                            lineSubtotal: Number(activeVariant.price || 0) * qty,
                            quantity: qty,
                          },
                        ],
                      },
                      selectedIds: [`buy-now-${product.id}-${activeVariant.id}`],
                    },
                  })
                } catch (err) {
                  setErrorMessage(err?.response?.data?.message || 'Không thể mua ngay.')
                }
              }}
            >
              Mua ngay
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-black bg-white border border-black/10 rounded-full cursor-pointer hover:bg-black/5 transition-colors"
              onClick={handleAddToCart}
            >
              Thêm vào giỏ hàng
            </button>
            </div>
          </div>

          {/* Các mục không chắc đúng nghiệp vụ (ví dụ “giới tính”) thì không hiển thị ở đây */}
        </motion.div>
      </motion.div>

      {/* Nội dung mô tả (gộp hợp lý vì ảnh bị che) */}
      <motion.div
        className="mt-12 bg-white border border-black/5 rounded-2xl p-6 md:p-8"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut', delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-black">Mô tả sản phẩm</h2>
        <p className="mt-3 text-sm text-black/70 leading-relaxed">
          {product.description || '—'}
        </p>

        {/* Review chi tiết bằng video (nếu có) */}
        {youtubeEmbedUrl ? (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.08 }}
          >
            <h3 className="text-base font-semibold text-black">Review chi tiết</h3>
            <div className="mt-3 bg-white border border-black/5 rounded-2xl overflow-hidden">
              <div className="relative w-full aspect-video">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={youtubeEmbedUrl}
                  title={product?.name ? `Video - ${product.name}` : 'Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#f5f5f5] border border-black/5 rounded-2xl">
            <p className="text-xs font-semibold text-black">Top notes</p>
            <p className="mt-2 text-sm text-black/70">{product.topNotes || '—'}</p>
          </div>
          <div className="p-4 bg-[#f5f5f5] border border-black/5 rounded-2xl">
            <p className="text-xs font-semibold text-black">Heart notes</p>
            <p className="mt-2 text-sm text-black/70">{product.heartNotes || '—'}</p>
          </div>
          <div className="p-4 bg-[#f5f5f5] border border-black/5 rounded-2xl">
            <p className="text-xs font-semibold text-black">Base notes</p>
            <p className="mt-2 text-sm text-black/70">{product.baseNotes || '—'}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ProductDetailPage

