import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import { getProductsApi } from '../../api/productsApi'
import { useAuth } from '../../hooks/useAuth'

const PromoPopup = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [product, setProduct] = useState(null)
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    // Chỉ hiển thị khi user đã đăng nhập
    if (!isAuthenticated || !user?.email) {
      setIsVisible(false)
      return
    }

    const checkAndShowPromo = () => {
      // Kiểm tra xem đã hiển thị popup cho user này trong phiên này chưa
      const sessionKey = `promoPopupShown_${user.email}`
      const hasShown = sessionStorage.getItem(sessionKey)
      if (hasShown) return

      const fetchRandomProduct = async () => {
        try {
          const res = await getProductsApi({ page: 0, size: 20, sortBy: 'createdAt', sortDir: 'desc' })
          const items = res?.content || []
          
          if (items.length > 0) {
            const randomIndex = Math.floor(Math.random() * items.length)
            setProduct(items[randomIndex])
            // Hiển thị sau một khoảng nhỏ để chuyển tiếp mượt mà
            setTimeout(() => setIsVisible(true), 1000)
          }
        } catch (error) {
          console.error('Failed to fetch promo product', error)
        }
      }

      fetchRandomProduct()
    }

    const handleCampaignResolved = () => {
      checkAndShowPromo()
    }

    window.addEventListener('campaignPopupClosed', handleCampaignResolved)
    window.addEventListener('noCampaignPopup', handleCampaignResolved)

    return () => {
      window.removeEventListener('campaignPopupClosed', handleCampaignResolved)
      window.removeEventListener('noCampaignPopup', handleCampaignResolved)
    }
  }, [isAuthenticated, user?.email])

  const handleClose = (e) => {
    e.stopPropagation()
    setIsVisible(false)
    if (user?.email) sessionStorage.setItem(`promoPopupShown_${user.email}`, 'true')
  }

  const handleProductClick = () => {
    setIsVisible(false)
    if (user?.email) sessionStorage.setItem(`promoPopupShown_${user.email}`, 'true')
    navigate(`/products/${product?.id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {isVisible && product && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Popup Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[800px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden cursor-pointer group"
            onClick={handleProductClick}
          >
            {/* Nút đóng */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur-md rounded-full text-black hover:bg-black hover:text-white transition-colors shadow-sm"
            >
              <FiX size={20} />
            </button>

            <div className="flex flex-col md:flex-row h-full">
              {/* Cột trái: Ảnh */}
              <div className="w-full md:w-[45%] bg-[#F8F8F8] p-8 md:p-12 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none" />
                <motion.img
                  src={product.thumbnail}
                  alt={product.name}
                  className="relative z-10 w-full max-h-[250px] md:max-h-[350px] object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)] group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Cột phải: Nội dung */}
              <div className="w-full md:w-[55%] p-8 md:p-12 flex flex-col justify-center bg-white">
                <span className="text-[11px] tracking-[0.2em] uppercase font-semibold text-black/40 mb-4 inline-block">
                  Gợi ý cho bạn
                </span>
                <h2 className="text-2xl md:text-3xl font-semibold text-black leading-tight mb-4 group-hover:text-black/70 transition-colors">
                  {product.name}
                </h2>
                <p className="text-sm md:text-base text-[#666666] leading-relaxed mb-8 line-clamp-4 font-light">
                  {product.description || `${product.name} mang đến cảm giác tinh tế và cuốn hút, một mùi hương không thể bỏ lỡ trong bộ sưu tập của bạn.`}
                </p>
                
                <div className="mt-auto flex items-center gap-4">
                  <button className="px-8 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-black/80 transition-colors shadow-lg shadow-black/20">
                    Khám phá ngay
                  </button>
                  <span className="text-sm font-medium text-black">
                    {product.minPrice ? `${new Intl.NumberFormat('vi-VN').format(product.minPrice)} đ` : 'Liên hệ'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default PromoPopup
