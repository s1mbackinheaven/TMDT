// src/components/layout/MainHeader.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getCartApi } from '../../api/cartApi'

const MainHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [isAtTop, setIsAtTop] = useState(true)
  const [isHidden, setIsHidden] = useState(false)
  const [cartCount, setCartCount] = useState(0)
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
            <button
              className={`cursor-pointer transition-colors ${
                isLightOnTop ? 'hover:text-white/80' : 'hover:text-black/60'
              }`}
            >
              Thương hiệu
            </button>
            <button
              className={`cursor-pointer transition-colors ${
                isLightOnTop ? 'hover:text-white/80' : 'hover:text-black/60'
              }`}
            >
              Tin tức
            </button>
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