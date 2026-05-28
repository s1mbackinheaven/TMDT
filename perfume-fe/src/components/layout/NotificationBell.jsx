import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiBell, FiCheckCircle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { countUnreadNotificationsApi, getUnreadNotificationsApi, markAllNotificationsAsReadApi, markNotificationAsReadApi } from '../../api/notificationApi'

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

const NotificationBell = ({ isLightOnTop = false }) => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const [unread, unreadCount] = await Promise.all([
        getUnreadNotificationsApi(),
        countUnreadNotificationsApi(),
      ])
      setItems(Array.isArray(unread) ? unread : [])
      setCount(Number(unreadCount || 0))
    } catch {
      setItems([])
      setCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleRead = async (item) => {
    await markNotificationAsReadApi(item.id)
    setOpen(false)
    if (item.actionUrl) navigate(item.actionUrl)
    await load()
  }

  const handleReadAll = async () => {
    await markAllNotificationsAsReadApi()
    await load()
  }

  const previewItems = useMemo(() => items.slice(0, 5), [items])

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`relative flex items-center justify-center w-9 h-9 text-base border rounded-full cursor-pointer transition-colors ${
          isLightOnTop
            ? 'text-white/85 border-white/30 hover:bg-white/10'
            : 'text-black/70 border-black/15 hover:bg-black/5'
        }`}
      >
        <FiBell size={18} />
        {count > 0 ? (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] text-white bg-red-500 rounded-full">
            {count}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full pt-3 z-50"
          >
            <div className="w-[360px] overflow-hidden rounded-[22px] border border-black/10 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.15)]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
                <div>
                  <div className="text-sm font-semibold text-black">Thông báo</div>
                  <div className="text-xs text-black/45">{count} chưa đọc</div>
                </div>
                <button type="button" onClick={handleReadAll} className="text-xs font-semibold text-black/60 hover:text-black">
                  Đọc tất cả
                </button>
              </div>

              <div className="max-h-[420px] overflow-auto">
                {loading ? (
                  <div className="p-4 text-sm text-black/55">Đang tải...</div>
                ) : previewItems.length ? (
                  previewItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleRead(item)}
                      className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-black/5 transition-colors border-b border-black/5 last:border-b-0"
                    >
                      <div className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center flex-shrink-0">
                        <FiCheckCircle className="text-black/50" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-black line-clamp-1">{item.title}</div>
                        <div className="text-xs text-black/55 line-clamp-2 mt-0.5">{formatNotificationMessage(item.message)}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-sm text-black/55">Không có thông báo mới.</div>
                )}
              </div>

              <div className="p-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    navigate('/notifications')
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold"
                >
                  Xem tất cả
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell
