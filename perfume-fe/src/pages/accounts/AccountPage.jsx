import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiChevronDown, FiLogOut, FiPackage, FiUser, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { cancelOrderApi, getMyOrdersApi, getOrderDetailApi, confirmReceivedOrderApi } from '../../api/orderApi'
import CancelOrderModal from '../checkout/CancelOrderModal'
import { getMyUserApi } from '../../api/userApi'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../hooks/useAuth'

const formatVnd = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' đ'

const TABS = [
  { id: 'profile', label: 'Thông tin tài khoản', icon: FiUser },
  { id: 'orders', label: 'Đơn hàng', icon: FiPackage },
  { id: 'logout', label: 'Đăng xuất', icon: FiLogOut },
]

const ORDER_STATUSES = ['PENDING_CONFIRMATION', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED']
const PAYMENT_STATUSES = ['UNPAID', 'PAID']
const ORDER_STATUS_LABELS = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
}
const PAYMENT_STATUS_LABELS = {
  UNPAID: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
}

const EXCLUDED_PROFILE_FIELDS = new Set(['id', 'profilePicture', 'role', 'status', 'isVerified'])
const FIELD_LABELS = {
  username: 'Tên đăng nhập',
  firstName: 'Họ',
  lastName: 'Tên',
  fullName: 'Họ và tên',
  email: 'Email',
  gender: 'Giới tính',
  phoneNumber: 'Số điện thoại',
  address: 'Địa chỉ',
}

const AccountPage = () => {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const { user, isAuthenticated, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [expandedItems, setExpandedItems] = useState(false)
  const [orderFilters, setOrderFilters] = useState({ status: '', paymentStatus: '', from: '', to: '' })
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  const displayUser = profile || user
  const fullName = useMemo(() => displayUser?.fullName || 'Chưa có tên', [displayUser])

  const buildOrderParams = () => {
    const params = {}
    if (orderFilters.status) params.status = orderFilters.status
    if (orderFilters.paymentStatus) params.paymentStatus = orderFilters.paymentStatus
    if (orderFilters.from) params.from = new Date(orderFilters.from).toISOString()
    if (orderFilters.to) params.to = new Date(`${orderFilters.to}T23:59:59.999Z`).toISOString()
    return params
  }

  const loadOrders = async () => {
    setLoadingOrders(true)
    try {
      const data = await getMyOrdersApi(buildOrderParams())
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    getMyUserApi().then(setProfile).catch(() => setProfile(null))
  }, [isAuthenticated])

  useEffect(() => {
    if (activeTab !== 'orders' || !isAuthenticated) return
    loadOrders()
  }, [activeTab, isAuthenticated])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const openOrderDetail = async (orderId) => {
    const data = await getOrderDetailApi(orderId)
    setSelectedOrder(data)
    setExpandedItems(false)
  }

  const handleConfirmReceived = async () => {
    if (!selectedOrder?.id) return
    try {
      const updated = await confirmReceivedOrderApi(selectedOrder.id)
      setSelectedOrder(updated)
      setExpandedItems(false)
      pushToast('Đã xác nhận nhận hàng thành công.')
      await loadOrders()
    } catch (err) {
      pushToast(err?.response?.data?.message || 'Không thể xác nhận đơn hàng', 'error')
    }
  }

  const handleCancelOrder = async (note) => {
    if (!selectedOrder?.id) return
    setCancelLoading(true)
    try {
      const updated = await cancelOrderApi(selectedOrder.id, { note })
      setSelectedOrder(updated)
      setCancelModalOpen(false)
      pushToast('Đã hủy đơn hàng.')
      await loadOrders()
    } catch (err) {
      pushToast(err?.response?.data?.message || 'Không thể hủy đơn hàng', 'error')
    } finally {
      setCancelLoading(false)
    }
  }

  const profileEntries = useMemo(() => {
    if (!displayUser) return []
    return Object.entries(displayUser).filter(([key]) => !EXCLUDED_PROFILE_FIELDS.has(key))
  }, [displayUser])

  return (
    <div className="py-10">
      <div className="w-full max-w-6xl px-4 mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-[30px] shadow-[0_24px_90px_rgba(0,0,0,0.10)] border border-black/5 overflow-hidden">
          <div className="px-6 md:px-10 py-8 border-b border-black/5 bg-gradient-to-r from-white to-[#fafafa]">
            <h1 className="text-3xl font-semibold text-black">Tài khoản của tôi</h1>
            <p className="mt-2 text-sm text-black/60">Xem và quản lý đầy đủ thông tin cá nhân, đơn hàng và đăng xuất.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
            <aside className="p-5 md:p-6 border-b lg:border-b-0 lg:border-r border-black/5 bg-[#fcfcfc]">
              <div className="p-5 rounded-3xl bg-black text-white">
                <div className="text-sm text-white/70">Xin chào</div>
                <div className="mt-1 text-xl font-semibold">{fullName}</div>
                <div className="mt-2 text-sm text-white/70">{displayUser?.email || '—'}</div>
              </div>

              <nav className="mt-6 space-y-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon
                  const active = activeTab === tab.id
                  return (
                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${active ? 'bg-black text-white shadow-lg' : 'bg-white text-black hover:bg-black/5 border border-black/5'}`}>
                      <Icon />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </aside>

            <section className="p-6 md:p-8">
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileEntries.map(([key, value]) => (
                    <InfoCard key={key} label={FIELD_LABELS[key] || key} value={formatValue(value, key)} />
                  ))}
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                    <div>
                      <h2 className="text-2xl font-semibold text-black">Đơn hàng của bạn</h2>
                      <p className="text-sm text-black/60">Bấm vào từng đơn để xem chi tiết.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 mb-4 items-end">
                    <label className="text-xs font-semibold text-black/50">
                      Trạng thái
                      <select value={orderFilters.status} onChange={(e) => setOrderFilters((prev) => ({ ...prev, status: e.target.value }))} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm outline-none">
                        <option value="">Tất cả trạng thái</option>
                        {ORDER_STATUSES.map((status) => <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-semibold text-black/50">
                      Thanh toán
                      <select value={orderFilters.paymentStatus} onChange={(e) => setOrderFilters((prev) => ({ ...prev, paymentStatus: e.target.value }))} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm outline-none">
                        <option value="">Tất cả thanh toán</option>
                        {PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{PAYMENT_STATUS_LABELS[status]}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-semibold text-black/50">
                      Từ ngày
                      <input type="date" value={orderFilters.from} onChange={(e) => setOrderFilters((prev) => ({ ...prev, from: e.target.value }))} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm outline-none" />
                    </label>
                    <label className="text-xs font-semibold text-black/50">
                      Đến ngày
                      <input type="date" value={orderFilters.to} onChange={(e) => setOrderFilters((prev) => ({ ...prev, to: e.target.value }))} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm outline-none" />
                    </label>
                    <button type="button" onClick={loadOrders} className="px-4 py-3 rounded-xl bg-black text-white text-sm font-semibold">Lọc đơn</button>
                  </div>

                  {loadingOrders ? (
                    <div className="py-12 text-center text-black/55">Đang tải đơn hàng...</div>
                  ) : orders.length ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {orders.map((order) => (
                        <button key={order.id} type="button" onClick={() => openOrderDetail(order.id)} className="text-left p-5 rounded-3xl border border-black/5 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs uppercase tracking-[0.2em] text-black/40">Mã đơn</div>
                              <div className="mt-1 text-lg font-semibold text-black">#{order.orderNumber}</div>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black text-white">{ORDER_STATUS_LABELS[order.status] || order.status}</span>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-black/70">
                            <div><span className="block text-black/40">Thanh toán</span>{PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}</div>
                            <div><span className="block text-black/40">Tổng tiền</span>{formatVnd(order.grandTotal)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-black/55 border border-dashed border-black/10 rounded-3xl">Chưa có đơn hàng nào.</div>
                  )}
                </div>
              )}

              {activeTab === 'logout' && (
                <div className="p-8 rounded-3xl bg-black text-white flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-2xl font-semibold">Đăng xuất khỏi tài khoản</div>
                    <div className="mt-2 text-white/70">Bạn sẽ quay về trang chủ sau khi đăng xuất.</div>
                  </div>
                  <button type="button" onClick={handleLogout} className="px-5 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors">
                    Đăng xuất ngay
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <CancelOrderModal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} onConfirm={handleCancelOrder} loading={cancelLoading} />

      {selectedOrder ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6" onClick={() => setSelectedOrder(null)}>
          <div className="w-full max-w-[80vw] max-h-[80vh] overflow-auto rounded-[28px] bg-white shadow-[0_30px_120px_rgba(0,0,0,0.25)] relative" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-5 border-b border-black/5 bg-white/95 backdrop-blur">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-black/40">Chi tiết đơn hàng</div>
                <div className="mt-1 text-2xl font-semibold text-black">#{selectedOrder.orderNumber}</div>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center">
                <FiX />
              </button>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <InfoCard label="Trạng thái" value={selectedOrder.status} />
                <InfoCard label="Thanh toán" value={selectedOrder.paymentStatus} />
                <InfoCard label="Phương thức" value={selectedOrder.paymentMethod} />
                <InfoCard label="Tổng tiền" value={formatVnd(selectedOrder.grandTotal)} />
              </div>
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <InfoCard label="Người nhận" value={selectedOrder.recipientName} />
                <InfoCard label="Số điện thoại" value={selectedOrder.recipientPhone} />
                <InfoCard label="Địa chỉ" value={selectedOrder.shippingAddress} />
                <InfoCard label="Phương thức" value={selectedOrder.paymentMethod} />
              </div>

              <div className="mt-6 p-5 rounded-3xl bg-[#f8f8f8] border border-black/5">
                <button type="button" onClick={() => setExpandedItems((prev) => !prev)} className="w-full flex items-center justify-between gap-3 text-left">
                  <div>
                    <div className="text-sm font-semibold text-black">Sản phẩm trong đơn</div>
                    <div className="mt-1 text-xs text-black/45">Bấm để xem hoặc ẩn danh sách</div>
                  </div>
                  <motion.div animate={{ rotate: expandedItems ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <FiChevronDown />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {expandedItems ? (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
                      <div className="mt-4 space-y-3">
                        {selectedOrder.items?.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-black/5">
                            <div className="w-16 h-16 rounded-xl bg-black/5 border border-black/5 overflow-hidden shrink-0 flex items-center justify-center">
                              {item.thumbnail ? (
                                <img src={item.thumbnail} alt={item.productName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] uppercase tracking-[0.2em] text-black/35">No img</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-black break-words">{item.productName}</div>
                              <div className="text-sm text-black/55">{item.variantVolume} · Số lượng: {item.quantity}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            <div className="sticky bottom-0 z-20 mt-6 flex justify-end gap-2 bg-gradient-to-t from-white via-white to-white/0 pt-6 pb-2">
              {selectedOrder.status !== 'COMPLETED' ? (
                <button type="button" onClick={() => setCancelModalOpen(true)} className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-black/10 text-black text-sm font-semibold bg-white">
                  Hủy đơn
                </button>
              ) : null}
              {selectedOrder.status === 'DELIVERED' ? (
                <button type="button" onClick={handleConfirmReceived} className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-black text-white text-sm font-semibold shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                  Xác nhận đã nhận hàng
                </button>
              ) : null}
              {selectedOrder.status === 'COMPLETED' ? (
                <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-600 text-white text-sm font-semibold shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                  Đơn hàng đã hoàn tất
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const formatValue = (value, key) => {
  if (key === 'gender') return formatGender(value)
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Có' : 'Không'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const formatGender = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return '—'
  if (['male', 'man', 'm', 'nam'].includes(normalized)) return 'Nam'
  if (['female', 'woman', 'f', 'nu', 'nữ'].includes(normalized)) return 'Nữ'
  if (['other', 'others', 'khac', 'khác'].includes(normalized)) return 'Khác'
  return String(value)
}

const InfoCard = ({ label, value }) => (
  <div className="p-4 rounded-2xl bg-[#fafafa] border border-black/5">
    <div className="text-xs uppercase tracking-[0.2em] text-black/40">{label}</div>
    <div className="mt-2 text-sm font-semibold text-black break-words">{value}</div>
  </div>
)

export default AccountPage
