import { useEffect, useState } from 'react'
import { FiBell } from 'react-icons/fi'
import { getMyNotificationsApi, markAllNotificationsAsReadApi, markNotificationAsReadApi } from '../../api/notificationApi'

const STATUS_LABELS = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  PAID: 'Đã thanh toán',
  UNPAID: 'Chưa thanh toán',
}

const formatNotificationMessage = (message = '') => {
  let output = message
  Object.entries(STATUS_LABELS).forEach(([key, label]) => {
    const re = new RegExp(`\\b${key}\\b`, 'g')
    output = output.replace(re, label)
  })
  return output
}

const API_BASE = 'http://localhost:8080'
const normalizeImageUrl = (url = '') => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`
  return url
}

const NotificationsPage = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getMyNotificationsApi()
      setItems(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleRead = async (id) => {
    await markNotificationAsReadApi(id)
    await load()
  }

  const handleReadAll = async () => {
    await markAllNotificationsAsReadApi()
    await load()
  }

  return (
    <div className="py-10">
      <div className="w-full max-w-5xl px-4 mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-black">Thông báo</h1>
            <p className="mt-2 text-sm text-black/60">Tất cả thông báo của bạn.</p>
          </div>
          <button type="button" onClick={handleReadAll} className="px-4 py-2 rounded-full bg-black text-white text-sm font-semibold">
            Đọc tất cả
          </button>
        </div>

        <div className="mt-6 bg-white border border-black/5 rounded-3xl overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-black/55">Đang tải...</div>
          ) : items.length ? (
            <div className="divide-y divide-black/5">
              {items.map((item) => (
                <button key={item.id} type="button" onClick={() => handleRead(item.id)} className={`w-full text-left p-5 flex items-start gap-4 hover:bg-black/5 transition-colors ${item.isRead ? 'bg-white' : 'bg-[#fafafa]'}`}>
                  {item.imageUrl ? <img src={normalizeImageUrl(item.imageUrl)} alt="notification" className="w-14 h-14 rounded-2xl object-cover border border-black/5" /> : <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center"><FiBell className="text-black/50" /></div>}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div className="font-semibold text-black">{item.title}</div>
                      {!item.isRead ? <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> : null}
                    </div>
                    <div className="mt-1 text-sm text-black/65">{formatNotificationMessage(item.message)}</div>
                    <div className="mt-2 text-xs text-black/40">{item.createdAt}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 text-sm text-black/55">Chưa có thông báo nào.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationsPage
