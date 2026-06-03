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

const EXCLUDED_PROFILE_FIELDS = new Set(['id', 'profilePicture', 'role', 'status', 'isVerified', 'loyaltyPoints', 'loyaltyTier', 'isOfficiallyEnabled'])
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

const TIER_INFO = {
  BRONZE: { label: 'Đồng', color: 'from-[#4a2e15] via-[#a67c52] to-[#3b2313]', textColor: 'text-white', next: 'SILVER', nextPoints: 100 },
  SILVER: { label: 'Bạc', color: 'from-[#f8f9fa] via-[#d7dce2] to-[#9ca3af]', textColor: 'text-slate-900', next: 'GOLD', nextPoints: 1000 },
  GOLD: { label: 'Vàng', color: 'from-[#ffd700] to-[#b8860b]', textColor: 'text-white', next: 'PLATINUM', nextPoints: 10000 },
  PLATINUM: { label: 'Bạch Kim', color: 'from-[#1a1a1a] via-[#2c2c2c] to-[#0a0a0a]', textColor: 'text-white', next: null, nextPoints: null },
}

const VIPCard = ({ user }) => {
  const tier = user?.loyaltyTier || 'BRONZE'
  const points = user?.loyaltyPoints || 0
  const info = TIER_INFO[tier] || TIER_INFO.BRONZE
  
  let progress = 100
  let pointsNeeded = 0
  if (info.nextPoints) {
    let currentBase = 0;
    if (tier === 'SILVER') currentBase = 100;
    else if (tier === 'GOLD') currentBase = 1000;

    const range = info.nextPoints - currentBase;
    const currentPointsInRange = points - currentBase;
    progress = Math.min(100, Math.max(0, (currentPointsInRange / range) * 100))
    pointsNeeded = info.nextPoints - points
  }

  return (
    <div className={`p-6 md:p-8 rounded-[24px] ${info.textColor || 'text-white'} bg-gradient-to-br ${info.color} shadow-lg relative overflow-hidden mb-8`}>
      {/* Geometric Overlay for All Cards */}
      <div className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10l80 80M90 10L10 90M50 0v100M0 50h100' stroke='%23ffffff' stroke-width='0.5' fill='none' /%3E%3Ccircle cx='50' cy='50' r='2' fill='%23ffffff' /%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%23ffffff' /%3E%3Ccircle cx='90' cy='90' r='1.5' fill='%23ffffff' /%3E%3Ccircle cx='90' cy='10' r='1.5' fill='%23ffffff' /%3E%3Ccircle cx='10' cy='90' r='1.5' fill='%23ffffff' /%3E%3C/svg%3E")`,
        backgroundSize: '80px 80px',
        mixBlendMode: 'overlay'
      }} />
      
      {/* Shine effect for all metallic cards */}
      <motion.div 
        initial={{ x: '-150%' }}
        animate={{ x: '250%' }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
        className={`absolute inset-0 z-0 w-1/2 bg-gradient-to-r from-transparent ${tier === 'PLATINUM' ? 'via-white/20' : 'via-white/60'} to-transparent skew-x-[30deg]`}
      />
      <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
        <FiUser size={200} />
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">Thẻ Thành Viên</p>
            <h2 className="text-3xl font-bold tracking-tight">{info.label}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">Điểm Tích Lũy</p>
            <h2 className="text-3xl font-bold tracking-tight">{points} <span className="text-lg opacity-80">pts</span></h2>
          </div>
        </div>

        {info.next && (
          <div className="mt-8">
            <div className="flex justify-between items-end mb-2 text-sm font-medium opacity-90">
              <span>Còn {pointsNeeded} điểm nữa để lên hạng {TIER_INFO[info.next].label}</span>
              <span>{info.nextPoints} pts</span>
            </div>
            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
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
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
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

  const filteredOrders = useMemo(() => {
    if (!orderSearchQuery) return orders
    return orders.filter(o => String(o.orderNumber).toLowerCase().includes(orderSearchQuery.toLowerCase()))
  }, [orders, orderSearchQuery])

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
      getMyUserApi().then(setProfile).catch(() => setProfile(null))
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
                <>
                  <VIPCard user={displayUser} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profileEntries.map(([key, value]) => (
                      <InfoCard key={key} label={FIELD_LABELS[key] || key} value={formatValue(value, key)} />
                    ))}
                  </div>
                </>
              )}

              {activeTab === 'orders' && (
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                    <div>
                      <h2 className="text-2xl font-semibold text-black">Đơn hàng của bạn</h2>
                      <p className="text-sm text-black/60">Bấm vào từng đơn để xem chi tiết.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 mb-4 items-end">
                    <label className="text-xs font-semibold text-black/50">
                      Tìm mã đơn
                      <input type="text" placeholder="Tìm mã..." value={orderSearchQuery} onChange={(e) => setOrderSearchQuery(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm outline-none" />
                    </label>
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
                  ) : filteredOrders.length ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {filteredOrders.map((order) => (
                        <button key={order.id} type="button" onClick={() => openOrderDetail(order.id)} className="text-left p-5 rounded-3xl border border-black/5 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs uppercase tracking-[0.2em] text-black/40">Mã đơn</div>
                              <div className="mt-1 text-lg font-semibold text-black">#{order.orderNumber}</div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(order.status, 'order')}`}>{ORDER_STATUS_LABELS[order.status] || order.status}</span>
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
                <InfoCard label="Trạng thái" value={<StatusBadge value={selectedOrder.status} />} />
                <InfoCard label="Thanh toán" value={<StatusBadge value={selectedOrder.paymentStatus} type="payment" />} />
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

const getStatusClasses = (value, type) => {
  if (type === 'payment') {
    return value === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
  }
  switch (value) {
    case 'PENDING_CONFIRMATION': return 'border border-dashed border-amber-400 text-amber-600 bg-amber-50'
    case 'PROCESSING': return 'bg-blue-50 text-blue-600 border border-blue-200'
    case 'SHIPPED': return 'bg-violet-50 text-violet-600 border border-violet-200'
    case 'DELIVERED': return 'bg-cyan-50 text-cyan-600 border border-cyan-200'
    case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border border-emerald-200'
    case 'CANCELLED': return 'bg-rose-50 text-rose-600 border border-rose-200'
    default: return 'bg-gray-50 text-gray-600 border border-gray-200'
  }
}

const StatusBadge = ({ value, type = 'order' }) => {
  const label = type === 'payment' ? PAYMENT_STATUS_LABELS[value] || value : ORDER_STATUS_LABELS[value] || value
  const classes = getStatusClasses(value, type)
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${classes}`}>{label}</span>
}

const InfoCard = ({ label, value }) => (
  <div className="p-4 rounded-2xl bg-[#fafafa] border border-black/5">
    <div className="text-xs uppercase tracking-[0.2em] text-black/40">{label}</div>
    <div className="mt-2 text-sm font-semibold text-black break-words">{value}</div>
  </div>
)

export default AccountPage
