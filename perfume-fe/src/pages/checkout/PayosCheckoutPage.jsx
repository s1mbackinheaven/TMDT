import { useMemo, useEffect } from 'react'
import { FiArrowLeft, FiCopy, FiShield, FiSmartphone } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'

const formatVnd = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' đ'

const PayosCheckoutPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { pushToast } = useToast()
  const payos = location.state?.payos || null
  const orderAmount = location.state?.orderAmount || 0
  const queryStatus = new URLSearchParams(location.search).get('status')

  const transferContent = payos?.transferContent || ''
  const checkoutUrl = payos?.qrCodeUrl || payos?.checkoutUrl || ''
  const amount = useMemo(() => Number(orderAmount || payos?.amount || 0), [orderAmount, payos])

  useEffect(() => {
    if (queryStatus === 'success') {
      pushToast('Thanh toán đã được xác nhận. Vui lòng chờ hệ thống cập nhật đơn hàng.')
    }
    if (queryStatus === 'cancel') {
      pushToast('Bạn đã hủy thanh toán.', 'error')
    }
  }, [queryStatus, pushToast])

  const copyText = async (text) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      pushToast('Đã sao chép nội dung chuyển khoản.')
    } catch {
      pushToast('Không thể sao chép nội dung.', 'error')
    }
  }

  if (!payos && !queryStatus) {
    return (
      <div className="w-full max-w-[1200px] px-4 md:px-10 lg:px-16 mx-auto py-10">
        <div className="p-6 bg-white border border-black/5 rounded-2xl text-center">
          <p className="text-sm text-black/60">Không tìm thấy dữ liệu thanh toán.</p>
          <button type="button" className="mt-4 px-5 py-2.5 text-sm font-semibold text-white bg-black rounded-full" onClick={() => navigate('/checkout')}>
            Quay lại thanh toán
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1200px] px-4 md:px-10 lg:px-16 mx-auto py-10">
      <button type="button" onClick={() => navigate('/checkout')} className="inline-flex items-center gap-2 text-sm text-black/70 hover:text-black transition-colors">
        <FiArrowLeft /> Quay lại
      </button>

      {queryStatus === 'success' ? (
        <div className="mt-4 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
          Thanh toán thành công. Hệ thống đang tự đồng bộ trạng thái đơn hàng.
        </div>
      ) : null}
      {queryStatus === 'cancel' ? (
        <div className="mt-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm">
          Bạn đã hủy thanh toán. Nếu muốn, bạn có thể quay lại và thanh toán sau.
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <section className="p-6 bg-white border border-black/5 rounded-3xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-black/50">Thanh toán qua mobile banking</p>
              <h1 className="mt-1 text-2xl font-semibold text-black">Quét mã QR để hoàn tất đơn hàng</h1>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-black/5 text-sm font-semibold text-black/70">
              <FiShield /> PayOS Secure
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 items-start">
            <div className="p-4 bg-[#fafafa] border border-black/10 rounded-3xl">
              {checkoutUrl ? (
                <img src={checkoutUrl} alt="PayOS QR" className="w-full aspect-square object-contain rounded-2xl bg-white" />
              ) : (
                <div className="w-full aspect-square rounded-2xl bg-white flex items-center justify-center text-sm text-black/45">Không có QR</div>
              )}
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-black/10 rounded-2xl bg-black/[0.02]">
                <p className="text-xs uppercase tracking-wider text-black/45">Số tiền cần chuyển</p>
                <p className="mt-2 text-3xl font-semibold text-black">{formatVnd(amount)}</p>
              </div>

              <div className="p-4 border border-black/10 rounded-2xl bg-black/[0.02]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-black/45">Nội dung chuyển khoản</p>
                    <p className="mt-2 text-lg font-semibold text-black">{transferContent || '—'}</p>
                  </div>
                  <button type="button" onClick={() => copyText(transferContent)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-black bg-white border border-black/10 rounded-full hover:bg-black/5 transition-colors">
                    <FiCopy /> Sao chép
                  </button>
                </div>
                <p className="mt-3 text-sm text-black/55">Vui lòng chuyển đúng số tiền và đúng nội dung để hệ thống tự động xác nhận đơn.</p>
              </div>

              <div className="p-4 border border-black/10 rounded-2xl bg-white">
                <div className="flex items-center gap-2 text-black font-semibold">
                  <FiSmartphone /> Hướng dẫn
                </div>
                <ol className="mt-3 space-y-2 text-sm text-black/65 list-decimal pl-5">
                  <li>Mở ứng dụng mobile banking trên điện thoại.</li>
                  <li>Quét mã QR phía trên hoặc chuyển khoản thủ công.</li>
                  <li>Nhập đúng nội dung chuyển khoản như đã hiển thị.</li>
                  <li>Giữ trang này cho tới khi giao dịch hoàn tất.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <aside className="p-6 bg-white border border-black/5 rounded-3xl h-fit sticky top-28">
          <h2 className="text-lg font-semibold text-black">Thông tin thanh toán</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-black/60">Order</span><span className="font-semibold">{payos.orderNumber || payos.orderId || '—'}</span></div>
            <div className="flex items-center justify-between"><span className="text-black/60">Trạng thái</span><span className="font-semibold text-emerald-600">Chờ thanh toán</span></div>
            <div className="flex items-center justify-between"><span className="text-black/60">Phương thức</span><span className="font-semibold">Mobile banking</span></div>
          </div>
          <button type="button" onClick={() => navigate('/account')} className="mt-6 w-full px-5 py-3 text-sm font-semibold text-white bg-black rounded-full hover:bg-black/90 transition-colors">
            Tôi đã thanh toán
          </button>
        </aside>
      </div>
    </div>
  )
}

export default PayosCheckoutPage
