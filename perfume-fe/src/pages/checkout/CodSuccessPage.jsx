import { useEffect, useState } from 'react'
import { FiCheckCircle, FiHome } from 'react-icons/fi'
import { useNavigate, useLocation } from 'react-router-dom'

const CodSuccessPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const orderNumber = location.state?.orderNumber || '—'
  const [secondsLeft, setSecondsLeft] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(timer)
          navigate('/', { replace: true })
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  const handleGoHome = () => {
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-[28px] border border-black/5 shadow-[0_24px_80px_rgba(0,0,0,0.12)] overflow-hidden">
        <div className="p-8 md:p-10 text-center bg-gradient-to-b from-emerald-50 to-white">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <FiCheckCircle size={40} />
          </div>
          <h1 className="mt-6 text-3xl md:text-4xl font-semibold text-black">Đặt hàng thành công</h1>
          <p className="mt-3 text-sm md:text-base text-black/60">
            Đơn hàng COD của bạn đã được ghi nhận. Mã đơn <span className="font-semibold text-black">#{orderNumber}</span>.
          </p>

          <div className="mt-8 rounded-2xl border border-black/5 bg-white px-5 py-4 inline-flex items-center gap-3 text-sm text-black/70">
            <span className="font-semibold text-black">Tự động về trang chủ sau {secondsLeft}s</span>
          </div>

          <button
            type="button"
            onClick={handleGoHome}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white font-semibold hover:bg-black/90 transition-colors"
          >
            <FiHome />
            Về trang chủ ngay
          </button>
        </div>
      </div>
    </div>
  )
}

export default CodSuccessPage
