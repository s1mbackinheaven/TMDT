import { useEffect, useMemo, useState } from 'react'
import { FiCheckCircle, FiEye, FiSend, FiTruck, FiX } from 'react-icons/fi'
import { getAllOrdersApi, updateOrderStatusApi } from '../../api/orderApi'
import OrderActionModal from '../checkout/OrderActionModal'
import CancelOrderModal from '../order/CancelOrderModal'

const ORDER_STATUSES = ['PENDING_CONFIRMATION', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED']
const PAYMENT_STATUSES = ['UNPAID', 'PAID']

const STATUS_LABELS = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
}

const PAYMENT_LABELS = {
  UNPAID: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
}

const FIELD_LABELS = {
  orderNumber: 'Mã đơn',
  username: 'Tài khoản',
  status: 'Trạng thái',
  paymentStatus: 'Thanh toán',
  paymentMethod: 'Phương thức',
  subtotal: 'Tạm tính',
  vatAmount: 'VAT',
  shippingFee: 'Phí ship',
  discountTotal: 'Giảm giá',
  grandTotal: 'Tổng tiền',
  recipientName: 'Người nhận',
  recipientPhone: 'Số điện thoại',
  shippingAddress: 'Địa chỉ',
  note: 'Ghi chú',
  adminNote: 'Ghi chú admin',
  paid: 'Đã thanh toán',
  createdAt: 'Ngày tạo',
  updatedAt: 'Ngày cập nhật',
}

const API_BASE = 'http://localhost:8080'
const formatVietnamDateTime = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value))
}

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

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filters, setFilters] = useState({ status: '', paymentStatus: '', from: '', to: '' })
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [actionModal, setActionModal] = useState({ open: false, orderId: null, status: '', note: '', mode: 'status' })
  const [cancelModal, setCancelModal] = useState({ open: false, orderId: null, note: '' })

  const loadOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus
      if (filters.from) params.from = new Date(filters.from).toISOString()
      if (filters.to) params.to = new Date(`${filters.to}T23:59:59.999Z`).toISOString()
      const data = await getAllOrdersApi(params)
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không tải được danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const applyFilters = () => loadOrders()

  const openDetail = (order) => setSelectedOrder(order)

  const openActionModal = (orderId, status) => {
    const current = orders.find((o) => o.id === orderId)
    setActionModal({
      open: true,
      orderId,
      status,
      note: current?.adminNote || '',
      mode: 'status',
    })
  }

  const openCancelModal = (orderId) => {
    const current = orders.find((o) => o.id === orderId)
    setCancelModal({ open: true, orderId, note: current?.adminNote || '' })
  }

  const updateStatus = async () => {
    const { orderId, status, note } = actionModal
    setActionLoadingId(orderId)
    try {
      await updateOrderStatusApi(orderId, { status, adminNote: note || '' })
      setActionModal({ open: false, orderId: null, status: '', note: '', mode: 'status' })
      await loadOrders()
      if (selectedOrder?.id === orderId) {
        const refreshed = await getAllOrdersApi({})
        setSelectedOrder(refreshed.find((o) => o.id === orderId) || null)
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không cập nhật được trạng thái đơn')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancelOrder = async (note) => {
    const { orderId } = cancelModal
    setActionLoadingId(orderId)
    try {
      await updateOrderStatusApi(orderId, { status: 'CANCELLED', adminNote: note || '' })
      setCancelModal({ open: false, orderId: null, note: '' })
      await loadOrders()
      if (selectedOrder?.id === orderId) {
        const refreshed = await getAllOrdersApi({})
        setSelectedOrder(refreshed.find((o) => o.id === orderId) || null)
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không hủy được đơn hàng')
    } finally {
      setActionLoadingId(null)
    }
  }

  const orderEntries = useMemo(() => {
    if (!selectedOrder) return []
    return Object.entries(selectedOrder).filter(([key]) => !['items'].includes(key))
  }, [selectedOrder])

  const formatOrderValue = (key, value) => {
    if (key === 'createdAt' || key === 'updatedAt') return formatVietnamDateTime(value)
    if (key === 'status') return ORDER_STATUS_LABELS[value] || value
    if (key === 'paymentStatus') return PAYMENT_STATUS_LABELS[value] || value
    if (key === 'paymentMethod') {
      const methods = { COD: 'Trả tiền khi nhận hàng', BANK_TRANSFER: 'Chuyển khoản / QR PayOS' }
      return methods[value] || value
    }
    return formatValue(value)
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-black">Quản lý đơn hàng</h1>
          <p className="mt-2 text-sm text-black/60">Xem danh sách, lọc đơn và cập nhật trạng thái xử lý.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-black/5 pointer-events-auto relative z-10">
        <label className="text-xs font-semibold text-black/50">
          Trạng thái
          <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm">
            <option value="">Tất cả trạng thái</option>
            {ORDER_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-black/50">
          Thanh toán
          <select value={filters.paymentStatus} onChange={(e) => setFilters((prev) => ({ ...prev, paymentStatus: e.target.value }))} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm">
            <option value="">Tất cả thanh toán</option>
            {PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{PAYMENT_LABELS[status]}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-black/50">
          Từ ngày
          <input type="date" value={filters.from} onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm" />
        </label>
        <label className="text-xs font-semibold text-black/50">
          Đến ngày
          <input type="date" value={filters.to} onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-sm" />
        </label>
        <button type="button" onClick={applyFilters} className="px-4 py-3 rounded-xl bg-black text-white text-sm font-semibold self-end">Lọc đơn</button>
      </div>

      {error ? <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div> : null}

      <div className="mt-6 bg-white border border-black/5 rounded-2xl overflow-hidden">
        {loading ? <div className="p-6 text-sm text-black/60">Đang tải danh sách đơn hàng...</div> : null}
        <div className="divide-y divide-black/5">
          {orders.map((order) => (
            <div key={order.id} className="p-4 md:p-5 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="font-semibold text-black">#{order.orderNumber}</div>
                <div className="text-sm text-black/55">{order.username} · {order.paymentMethod} · {formatVnd(order.grandTotal)}</div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge value={order.status} />
                <StatusBadge value={order.paymentStatus} type="payment" />
                <button type="button" onClick={() => openDetail(order)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-semibold"><FiEye /> Xem chi tiết</button>
                {order.status === 'PENDING_CONFIRMATION' ? <ActionButton label="Xác nhận" icon={<FiSend />} onClick={() => openActionModal(order.id, 'PROCESSING')} loading={actionLoadingId === order.id} /> : null}
                {order.status === 'PROCESSING' ? <ActionButton label="Đang giao" icon={<FiTruck />} onClick={() => openActionModal(order.id, 'SHIPPED')} loading={actionLoadingId === order.id} /> : null}
                {order.status === 'SHIPPED' ? <ActionButton label="Đã giao" icon={<FiCheckCircle />} onClick={() => openActionModal(order.id, 'DELIVERED')} loading={actionLoadingId === order.id} /> : null}
                {order.status === 'PENDING_CONFIRMATION' || order.status === 'PROCESSING' ? <ActionButton label="Hủy đơn" icon={<FiX />} onClick={() => openCancelModal(order.id)} loading={actionLoadingId === order.id} /> : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <OrderActionModal
        isOpen={actionModal.open}
        title="Cập nhật đơn hàng"
        description={`Chuyển sang trạng thái ${STATUS_LABELS[actionModal.status] || actionModal.status}`}
        note={actionModal.note}
        setNote={(note) => setActionModal((prev) => ({ ...prev, note }))}
        onClose={() => setActionModal({ open: false, orderId: null, status: '', note: '', mode: 'status' })}
        onConfirm={updateStatus}
        confirmLabel="Xác nhận"
        confirmLoading={actionLoadingId === actionModal.orderId}
      />
      <CancelOrderModal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, orderId: null, note: '' })}
        onConfirm={handleCancelOrder}
        loading={actionLoadingId === cancelModal.orderId}
      />

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6" onClick={() => setSelectedOrder(null)}>
          <div className="w-full max-w-[80vw] max-h-[80vh] overflow-auto rounded-[28px] bg-white shadow-[0_30px_120px_rgba(0,0,0,0.25)]" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-5 border-b border-black/5 bg-white/95 backdrop-blur">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-black/40">Order detail</div>
                <div className="mt-1 text-2xl font-semibold text-black">#{selectedOrder.orderNumber}</div>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center"><FiX /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orderEntries.map(([key, value]) => (
                  <InfoCard key={key} label={FIELD_LABELS[key] || key} value={formatOrderValue(key, value)} />
                ))}
              </div>
              <div className="mt-6 p-5 rounded-3xl bg-[#f8f8f8] border border-black/5">
                <div className="text-sm font-semibold text-black">Sản phẩm trong đơn</div>
                <div className="mt-4 space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-black/5">
                      <div className="w-16 h-16 rounded-xl bg-black/5 border border-black/5 overflow-hidden shrink-0">
                        {item.thumbnail ? <img src={item.thumbnail} alt={item.productName} className="w-full h-full object-cover" /> : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-black">{item.productName}</div>
                        <div className="text-sm text-black/55">{item.variantVolume} · SL: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-semibold text-black">{formatVnd(item.lineTotal)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {selectedOrder.status === 'PENDING_CONFIRMATION' ? <ActionButton label="Xác nhận đơn" icon={<FiSend />} onClick={() => openActionModal(selectedOrder.id, 'PROCESSING')} loading={actionLoadingId === selectedOrder.id} /> : null}
                {selectedOrder.status === 'PROCESSING' ? <ActionButton label="Chuyển giao" icon={<FiTruck />} onClick={() => openActionModal(selectedOrder.id, 'SHIPPED')} loading={actionLoadingId === selectedOrder.id} /> : null}
                {selectedOrder.status === 'SHIPPED' ? <ActionButton label="Đánh dấu đã giao" icon={<FiCheckCircle />} onClick={() => openActionModal(selectedOrder.id, 'DELIVERED')} loading={actionLoadingId === selectedOrder.id} /> : null}
                {selectedOrder.status === 'PENDING_CONFIRMATION' || selectedOrder.status === 'PROCESSING' ? <ActionButton label="Hủy đơn" icon={<FiX />} onClick={() => openCancelModal(selectedOrder.id)} loading={actionLoadingId === selectedOrder.id} /> : null}
                {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' ? <ActionButton label="Hủy đơn" icon={<FiX />} onClick={() => openCancelModal(selectedOrder.id)} loading={actionLoadingId === selectedOrder.id} /> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <CancelOrderModal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, orderId: null, note: '' })}
        onConfirm={handleCancelOrder}
        loading={actionLoadingId === cancelModal.orderId}
      />
    </div>
  )
}

const formatVnd = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' đ'
const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Có' : 'Không'
  if (typeof value === 'object') return JSON.stringify(value)
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

const ActionButton = ({ label, icon, onClick, loading }) => (
  <button type="button" onClick={onClick} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-sm font-semibold text-black disabled:opacity-50">
    {icon}
    {loading ? 'Đang xử lý...' : label}
  </button>
)

const InfoCard = ({ label, value }) => (
  <div className="p-4 rounded-2xl bg-[#fafafa] border border-black/5">
    <div className="text-xs uppercase tracking-[0.2em] text-black/40">{label}</div>
    <div className="mt-2 text-sm font-semibold text-black break-words">{value}</div>
  </div>
)

export default AdminOrdersPage
