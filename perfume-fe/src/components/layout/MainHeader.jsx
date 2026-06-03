// src/components/layout/MainHeader.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiChevronDown, FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getCartApi } from '../../api/cartApi'
import { getBrandsApi } from '../../api/filtersApi'
import NotificationBell from './NotificationBell'

const MainHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [isAtTop, setIsAtTop] = useState(true)
  const [isHidden, setIsHidden] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [brands, setBrands] = useState([])
  const [brandsLoading, setBrandsLoading] = useState(false)
  const [brandQuery, setBrandQuery] = useState('')
  const [brandMenuOpen, setBrandMenuOpen] = useState(false)
  const lastYRef = useRef(0)
  const tickingRef = useRef(false)
  const TOP_THRESHOLD = 8
  const HIDE_AFTER = 120
  const isHome = location.pathname === '/'
  const isLightOnTop = isHome && isAtTop

  const handleGoAuth = () => {
    // Nếu đã đăng nhập thì đi trang tài khoản, chưa thì đi auth
    navigate(isAuthenticated ? '/account' : '/auth')
  }

  const handleGoHome = () => {
    navigate('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGoProducts = () => {
    navigate('/products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGoNews = (categoryName = '') => {
    navigate(categoryName ? `/news?categoryName=${encodeURIComponent(categoryName)}` : '/news')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  

  const handleGoCart = () => {
    navigate('/cart')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    // Giữ header đồng bộ mọi trang: top => trong suốt + to; cuộn xuống => thu nhỏ + ẩn; cuộn lên => hiện (thu nhỏ)
    const handleScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true

      window.requestAnimationFrame(() => {
        const currentY = Math.max(0, window.scrollY || 0)
        const lastY = lastYRef.current

        const nextIsAtTop = currentY <= TOP_THRESHOLD
        setIsAtTop(nextIsAtTop)

        if (nextIsAtTop) {
          setIsHidden(false)
        } else {
          const isScrollingDown = currentY > lastY

          // Cuộn xuống: vẫn giữ header thu nhỏ, chỉ ẩn khi đã cuộn đủ xa
          if (isScrollingDown && currentY > HIDE_AFTER) setIsHidden(true)
          if (!isScrollingDown) setIsHidden(false)
        }

        lastYRef.current = currentY
        tickingRef.current = false
      })
    }

    lastYRef.current = Math.max(0, window.scrollY || 0)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isCompact = !isAtTop

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const res = await getCartApi()
        setCartCount(res?.itemsCount ?? (Array.isArray(res?.items) ? res.items.length : 0))
      } catch {
        setCartCount(0)
      }
    }
    fetchCartCount()
  }, [location.pathname, location.key])

  useEffect(() => {
    const loadBrands = async () => {
      setBrandsLoading(true)
      try {
        const data = await getBrandsApi()
        setBrands(Array.isArray(data) ? data : [])
      } catch {
        setBrands([])
      } finally {
        setBrandsLoading(false)
      }
    }
    loadBrands()
  }, [])

  const headerVariants = {
    show: { y: 0, opacity: 1 },
    hide: { y: -84, opacity: 0 },
  }

  const barVariants = {
    top: {
      backgroundColor: 'rgba(255,255,255,0)',
      borderColor: 'rgba(0,0,0,0)',
      boxShadow: '0 0 0 rgba(0,0,0,0)',
    },
    scrolled: {
      backgroundColor: 'rgba(255,255,255,0.82)',
      borderColor: 'rgba(0,0,0,0.08)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    },
  }

  const normalizedBrands = useMemo(() => {
    return [...brands].sort((a, b) => (a?.name || '').localeCompare(b?.name || '', 'vi'))
  }, [brands])

  const filteredBrands = useMemo(() => {
    const q = brandQuery.trim().toLowerCase()
    if (!q) return normalizedBrands
    return normalizedBrands.filter((brand) => (brand?.name || '').toLowerCase().includes(q))
  }, [normalizedBrands, brandQuery])

  const brandGroups = useMemo(() => {
    const groups = {}
    filteredBrands.forEach((brand) => {
      const letter = (brand?.name?.[0] || '#').toUpperCase()
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(brand)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'vi'))
  }, [filteredBrands])

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-30"
      variants={headerVariants}
      animate={isHidden ? 'hide' : 'show'}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
    >
      <motion.div
        className="backdrop-blur-md"
        variants={barVariants}
        animate={isAtTop ? 'top' : 'scrolled'}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ borderBottomWidth: 1, borderBottomStyle: 'solid' }}
      >
        <motion.div
          className="w-full px-6 md:px-10 lg:px-16"
          animate={{ paddingTop: isCompact ? 8 : 16, paddingBottom: isCompact ? 8 : 16 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <motion.div
            className={`flex items-center justify-between gap-8 w-full ${
              isLightOnTop ? 'text-white' : 'text-black'
            }`}
            animate={{ scale: isCompact ? 0.75 : 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            style={{ transformOrigin: 'top' }}
          >
          {/* Logo bên trái */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-10 h-10 text-lg font-semibold border rounded-full ${
                isLightOnTop ? 'border-white/40' : 'border-black/20'
              }`}
            >
              BACK
            </div>
            <span className="hidden text-base font-medium tracking-[0.25em] uppercase sm:inline">
              Perfume
            </span>
          </div>

          {/* Menu chính */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <button
              className={`cursor-pointer transition-colors ${
                isLightOnTop ? 'hover:text-white/80' : 'hover:text-black/60'
              }`}
              onClick={handleGoHome}
            >
              Trang chủ
            </button>
            <button
              className={`cursor-pointer transition-colors ${
                isLightOnTop ? 'hover:text-white/80' : 'hover:text-black/60'
              }`}
              onClick={() => {
                navigate('/about')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              Về BACK Perfume
            </button>
            <button
              className={`cursor-pointer transition-colors ${
                isLightOnTop ? 'hover:text-white/80' : 'hover:text-black/60'
              }`}
              onClick={handleGoProducts}
            >
              Bộ sưu tập nước hoa
            </button>
            <div className="relative group" onMouseEnter={() => setBrandMenuOpen(true)} onMouseLeave={() => setBrandMenuOpen(false)}>
              <button
                className={`cursor-pointer transition-colors inline-flex items-center gap-1 ${
                  isLightOnTop ? 'hover:text-white/80' : 'hover:text-black/60'
                }`}
                onClick={() => navigate('/products')}
              >
                Thương hiệu
                <FiChevronDown size={14} />
              </button>

              <AnimatePresence>
                {brandMenuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute left-1/2 top-full z-50 pt-4 -translate-x-1/2"
                  >
                    <div className="w-[min(1280px,calc(100vw-48px))] rounded-[26px] border border-black/10 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.18)] overflow-hidden">
                      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-black/5">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-black/40">Thương hiệu</div>
                          <div className="mt-1 text-lg font-semibold text-black">Chọn theo chữ cái</div>
                        </div>
                        <input
                          value={brandQuery}
                          onChange={(e) => setBrandQuery(e.target.value)}
                          placeholder="Tìm thương hiệu..."
                          className="w-[300px] px-4 py-2.5 text-sm border border-black/10 rounded-xl outline-none focus:border-black/30"
                        />
                      </div>

                      <div className="px-6 py-5">
                        <div className="flex flex-wrap gap-2 mb-5">
                          <button
                            type="button"
                            className="min-w-10 h-9 px-3 rounded-lg text-sm border border-black/10 hover:bg-black hover:text-white transition-colors bg-black text-white"
                            onClick={() => setBrandQuery('')}
                          >
                            All
                          </button>
                          {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                            <button
                              key={letter}
                              type="button"
                              className="min-w-10 h-9 px-3 rounded-lg text-sm border border-black/10 hover:bg-black hover:text-white transition-colors"
                              onClick={() => {
                                const target = document.getElementById(`brand-letter-${letter}`)
                                target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              }}
                            >
                              {letter}
                            </button>
                          ))}
                        </div>

                        <div className="max-h-[420px] overflow-auto pr-2 space-y-8">
                          {brandsLoading ? (
                            <div className="py-10 text-sm text-black/55">Đang tải thương hiệu...</div>
                          ) : brandGroups.length ? (
                            brandGroups.map(([letter, items]) => (
                              <div key={letter} id={`brand-letter-${letter}`}>
                                <div className="mb-4 text-3xl font-semibold text-black">{letter}</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-x-10 gap-y-4">
                                  {items.map((brand) => (
                                    <button
                                      key={brand.id}
                                      type="button"
                                      className="text-left text-[15px] text-black/75 hover:text-black transition-colors"
                                      onClick={() => {
                                        setBrandMenuOpen(false)
                                        navigate(`/products?brandId=${brand.id}`)
                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                      }}
                                    >
                                      {brand.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-10 text-sm text-black/55">Không có thương hiệu phù hợp.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <div className="relative group">
              <button
                className={`cursor-pointer transition-colors inline-flex items-center gap-1 ${
                  isLightOnTop ? 'hover:text-white/80' : 'hover:text-black/60'
                }`}
                onClick={() => handleGoNews()}
              >
                Tin tức
                <FiChevronDown size={14} />
              </button>
              <div className="absolute left-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="min-w-[240px] rounded-2xl border border-black/10 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.12)] overflow-hidden">
                  <button type="button" onClick={() => handleGoNews('Kiến thức nước hoa')} className="w-full text-left px-4 py-3 text-sm font-medium text-black hover:bg-black/5 transition-colors">Kiến thức nước hoa</button>
                  <button type="button" onClick={() => handleGoNews('Review nước hoa')} className="w-full text-left px-4 py-3 text-sm font-medium text-black hover:bg-black/5 transition-colors">Review nước hoa</button>
                </div>
              </div>
            </div>
            <button
              className={`cursor-pointer transition-colors ${
                isLightOnTop ? 'hover:text-white/80' : 'hover:text-black/60'
              }`}
            >
              Liên hệ
            </button>
          </nav>

          {/* Icon + nút bên phải */}
          <div className="flex items-center gap-4">
            {/* Tìm kiếm */}
            <button
              className={`flex items-center justify-center w-9 h-9 text-base border rounded-full cursor-pointer transition-colors ${
                isLightOnTop
                  ? 'text-white/85 border-white/30 hover:bg-white/10'
                  : 'text-black/70 border-black/15 hover:bg-black/5'
              }`}
            >
              <FiSearch size={18} />
            </button>

            {/* Giỏ hàng */}
            <button
              className={`relative flex items-center justify-center w-9 h-9 text-base border rounded-full cursor-pointer transition-colors ${
                isLightOnTop
                  ? 'text-white/85 border-white/30 hover:bg-white/10'
                  : 'text-black/70 border-black/15 hover:bg-black/5'
              }`}
              onClick={handleGoCart}
            >
              <FiShoppingCart size={18} />
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] text-white bg-red-500 rounded-full">
                {cartCount}
              </span>
            </button>

            <NotificationBell isLightOnTop={isLightOnTop} />

            {/* Tài khoản */}
            <button
              className={`flex items-center justify-center w-9 h-9 text-base border rounded-full cursor-pointer transition-colors ${
                isLightOnTop
                  ? 'text-white/85 border-white/30 hover:bg-white/10'
                  : 'text-black/70 border-black/15 hover:bg-black/5'
              }`}
              onClick={handleGoAuth}
            >
              <FiUser size={18} />
            </button>

            {/* Nút liên hệ tư vấn */}
            <button className="hidden sm:inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-black rounded-full cursor-pointer hover:bg-black/90 transition-colors">
              Liên hệ tư vấn
            </button>
          </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.header>
  )
}

export default MainHeader