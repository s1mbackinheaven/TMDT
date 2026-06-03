import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import { getActiveCampaignsApi } from '../../api/campaignsApi'
import { useAuth } from '../../hooks/useAuth'

const CampaignPopup = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [campaign, setCampaign] = useState(null)
  const navigate = useNavigate()
  const { user, isAuthenticated: authContextIsAuthenticated } = useAuth()
  const isAuthenticated = authContextIsAuthenticated && !!user?.email

  useEffect(() => {
    // Chỉ kiểm tra khi user đã đăng nhập
    if (!isAuthenticated) return

    const emailKey = user.email
    const hasShownKey = `campaignPopupShown_${emailKey}`
    const hasShown = sessionStorage.getItem(hasShownKey)

    if (hasShown) {
      setTimeout(() => window.dispatchEvent(new Event('noCampaignPopup')), 10)
      return // Đã show trong phiên đăng nhập này rồi
    }

    const checkCampaign = async () => {
      try {
        const campaigns = await getActiveCampaignsApi()
        if (campaigns && campaigns.length > 0) {
          // Lấy campaign đầu tiên đang active
          setCampaign(campaigns[0])
          
          // Delay một chút trước khi hiện
          const timer = setTimeout(() => {
            setIsVisible(true)
          }, 1500)
          return () => clearTimeout(timer)
        } else {
          window.dispatchEvent(new Event('noCampaignPopup'))
        }
      } catch (error) {
        console.error('Failed to load campaign popup', error)
        window.dispatchEvent(new Event('noCampaignPopup'))
      }
    }

    checkCampaign()
  }, [isAuthenticated, user?.email])

  const handleClose = () => {
    setIsVisible(false)
    if (user?.email) {
      sessionStorage.setItem(`campaignPopupShown_${user.email}`, 'true')
    }
    window.dispatchEvent(new Event('campaignPopupClosed'))
  }

  const handleActionClick = () => {
    handleClose()
    if (campaign.brandId) {
      // Có thể chuyển hướng đến trang filter theo brand, tạm thời đưa về trang sản phẩm
      navigate('/products')
    } else {
      navigate('/products')
    }
  }

  return (
    <AnimatePresence>
      {isVisible && campaign && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Popup Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[750px] bg-white overflow-hidden rounded-2xl shadow-2xl font-[Montserrat] flex flex-col"
          >
            {/* Nút tắt */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-colors"
            >
              <FiX size={20} />
            </button>

            {/* Banner Image - Tỉ lệ 2:1 phù hợp hoàn hảo với 1200x588 */}
            <div 
              className="relative w-full aspect-[2/1] bg-gray-100 overflow-hidden cursor-pointer group shrink-0" 
              onClick={handleActionClick}
            >
              {campaign.bannerUrl ? (
                <img
                  src={campaign.bannerUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                  <span className="text-5xl font-bold tracking-widest mb-3">SALE</span>
                  <span className="text-2xl opacity-90">{campaign.title}</span>
                </div>
              )}
              
              {/* Overlay mờ phần dưới ảnh để text dễ đọc nếu muốn */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
              
              {/* Badge giảm giá nổi bật trên ảnh */}
              <div className="absolute bottom-5 left-6 text-white pointer-events-none">
                <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-md mb-2 shadow-lg tracking-wider">
                  HOT DEAL
                </span>
                <h3 className="text-2xl md:text-3xl font-bold drop-shadow-md">{campaign.title}</h3>
              </div>
            </div>

            {/* Content & Description - Phần dưới ảnh */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-white">
              <div className="flex-1 text-center md:text-left">
                <p className="text-black text-base leading-relaxed font-medium">
                  {campaign.description || 'Ưu đãi đặc biệt đang chờ bạn khám phá. Đừng bỏ lỡ cơ hội này!'}
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  Giảm thêm tới <span className="text-red-600 font-bold text-lg">-{campaign.extraDiscountPercent}%</span> khi mua sắm ngay hôm nay.
                </div>
              </div>

              <button
                onClick={handleActionClick}
                className="w-full md:w-auto shrink-0 px-8 py-3.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors uppercase tracking-wider shadow-lg shadow-black/20"
              >
                Khám phá ngay
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CampaignPopup
