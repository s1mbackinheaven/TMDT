import { useEffect, useMemo, useState } from 'react'
import { FiCreditCard, FiHome, FiShoppingBag } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { createPayosCheckoutApi } from '../../api/checkoutApi'
import { getMyUserApi } from '../../api/userApi'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../hooks/useAuth'

const formatVnd = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' đ'

const PAYMENT_METHODS = [
  { id: 'COD', label: 'Trả tiền sau khi nhận hàng', description: 'Thanh toán khi nhận hàng', icon: FiHome },
  { id: 'BANK_TRANSFER', label: 'Trả qua mobile banking', description: 'Thanh toán bằng QR PayOS', icon: FiCreditCard },
]

const CheckoutPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { pushToast } = useToast()
  const { user } = useAuth()
  const cart = location.state?.cart || null
  const selectedIds = location.state?.selectedIds || []
  const selectedItems = Array.isArray(cart?.items)
    ? cart.items.filter((item) => selectedIds.length ? selectedIds.includes(item.id) : true)
    : []

  const subtotal = useMemo(() => selectedItems.reduce((sum, item) => sum + Number(item.lineSubtotal || 0), 0), [selectedItems])
  const shippingFee = 30000
  const total = subtotal + shippingFee

  const [form, setForm] = useState({ recipientName: '', recipientPhone: '', shippingAddress: '', note: '', paymentMethod: 'COD' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const preload = async () => {
      try {
        const profile = await getMyUserApi()
        setForm((prev) => ({
          ...prev,
          recipientName: profile?.fullName || user?.fullName || '',
          recipientPhone: profile?.phoneNumber || '',
          shippingAddress: profile?.address || '',
        }))
      } catch {
        setForm((prev) => ({
          ...prev,
          recipientName: user?.fullName || '',
        }))
      }
    }

    preload()
  }, [user])

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.recipientPhone || !form.shippingAddress) {
      setErrorMessage('Vui lòng điền số điện thoại và địa chỉ nhận hàng.')
      return
    }
    setIsSubmitting(true)
    setErrorMessage('')
    try {
      const payload = {
        shippingAddress: form.shippingAddress,
        recipientPhone: form.recipientPhone,
        recipientName: form.recipientName || user?.fullName || 'Khách hàng',
        note: form.note,
        paymentMethod: form.paymentMethod,
      }

      if (form.paymentMethod === 'BANK_TRANSFER') {
        const res = await createPayosCheckoutApi(payload)
        window.location.href = res.checkoutUrl
        return
      }

      const data = await createPayosCheckoutApi(payload)
      pushToast('Đã tạo đơn COD thành công.')
      navigate('/checkout/cod-success', { state: { orderNumber: data?.orderNumber } })
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Không tạo được đơn hàng.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-[1200px] px-4 md:px-10 lg:px-16 mx-auto py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-black">Thanh toán</h1>
          <p className="mt-2 text-sm text-black/60">Thông tin nhận hàng sẽ được tự động điền từ hồ sơ của bạn và có thể chỉnh sửa.</p>
        </div>
        <button type="button" onClick={() => navigate('/cart')} className="px-5 py-2.5 text-sm font-semibold text-black bg-white border border-black/10 rounded-full hover:bg-black/5 transition-colors">Quay lại giỏ hàng</button>
      </div>

      {errorMessage ? <div className="mt-5 px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">{errorMessage}</div> : null}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          <div className="p-6 bg-white border border-black/5 rounded-2xl">
            <h2 className="text-lg font-semibold text-black">Thông tin nhận hàng</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={form.recipientName} onChange={handleChange('recipientName')} placeholder={user?.fullName || 'Họ và tên'} className="w-full px-4 py-3 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30" />
              <input value={form.recipientPhone} onChange={handleChange('recipientPhone')} placeholder="Số điện thoại" className="w-full px-4 py-3 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30" />
              <textarea value={form.shippingAddress} onChange={handleChange('shippingAddress')} placeholder="Địa chỉ nhận hàng" rows={3} className="md:col-span-2 w-full px-4 py-3 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30 resize-none" />
              <textarea value={form.note} onChange={handleChange('note')} placeholder="Ghi chú đơn hàng" rows={3} className="md:col-span-2 w-full px-4 py-3 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30 resize-none" />
            </div>
          </div>

          <div className="p-6 bg-white border border-black/5 rounded-2xl">
            <h2 className="text-lg font-semibold text-black">Phương thức thanh toán</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon
                const selected = form.paymentMethod === method.id
                return (
                  <button key={method.id} type="button" onClick={() => setForm((prev) => ({ ...prev, paymentMethod: method.id }))} className={`text-left p-4 rounded-2xl border transition-all ${selected ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black hover:bg-black/5'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? 'bg-white/10' : 'bg-black/5'}`}><Icon size={18} /></div>
                      <div>
                        <div className="font-semibold">{method.label}</div>
                        <div className={`mt-1 text-sm ${selected ? 'text-white/75' : 'text-black/55'}`}>{method.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <aside className="p-6 bg-white border border-black/5 rounded-2xl h-fit sticky top-28">
          <h2 className="text-lg font-semibold text-black flex items-center gap-2"><FiShoppingBag /> Đơn hàng</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-black/60">Sản phẩm</span><span className="font-semibold">{selectedItems.length}</span></div>
            <div className="flex items-center justify-between"><span className="text-black/60">Tạm tính</span><span className="font-semibold">{formatVnd(subtotal)}</span></div>
            <div className="flex items-center justify-between"><span className="text-black/60">Phí ship</span><span className="font-semibold">{formatVnd(shippingFee)}</span></div>
            <div className="flex items-center justify-between"><span className="text-black/60">Tổng thanh toán</span><span className="font-semibold text-base">{formatVnd(total)}</span></div>
          </div>

          <button type="button" onClick={handleSubmit} disabled={isSubmitting || !selectedItems.length} className="mt-6 w-full px-5 py-3 text-sm font-semibold text-white bg-black rounded-full disabled:opacity-40 hover:bg-black/90 transition-colors">
            {form.paymentMethod === 'BANK_TRANSFER' ? 'Tạo QR thanh toán' : 'Xác nhận đơn hàng'}
          </button>
        </aside>
      </div>
    </div>
  )
}

export default CheckoutPage
