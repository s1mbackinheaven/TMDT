import { useState } from 'react'
import { broadcastAdminNotificationApi, createAdminNotificationApi } from '../../api/adminNotificationApi'

const TYPES = [
  { id: 'ADMIN', label: 'ADMIN' },
  { id: 'SYSTEM', label: 'SYSTEM' },
  { id: 'ORDER', label: 'ORDER' },
  { id: 'PRODUCT', label: 'PRODUCT' },
  { id: 'ARTICLE', label: 'ARTICLE' },
]

const AdminNotificationsPage = () => {
  const [recipientUserId, setRecipientUserId] = useState('')
  const [type, setType] = useState('ADMIN')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [actionUrl, setActionUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const payload = {
        recipientUserId: recipientUserId ? Number(recipientUserId) : null,
        type,
        title,
        message,
        actionUrl: actionUrl || null,
        imageUrl: imageUrl || null,
      }
      if (recipientUserId) {
        await createAdminNotificationApi(payload)
      } else {
        await broadcastAdminNotificationApi(payload)
      }
      setStatus('success')
      setTitle('')
      setMessage('')
      setActionUrl('')
      setImageUrl('')
      setRecipientUserId('')
    } catch (err) {
      setStatus('error')
      setError(err?.response?.data?.message || 'Không gửi được thông báo')
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-black">Notification Admin</h1>
        <p className="mt-2 text-sm text-black/60">Gửi thông báo cho 1 user hoặc broadcast cho toàn bộ user.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-3xl border border-black/5 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-black/70">
            Gửi riêng cho ID
            <input value={recipientUserId} onChange={(e) => setRecipientUserId(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 outline-none" placeholder="Ví dụ: 12" />
          </label>
          <label className="text-sm font-medium text-black/70">
            Kiểu
            <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 bg-white outline-none">
              {TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
        </div>

        <label className="text-sm font-medium text-black/70 block">
          Tiêu đề
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 outline-none" />
        </label>

        <label className="text-sm font-medium text-black/70 block">
          Nội dung
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 outline-none" />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-black/70">
            URL hành động
            <input value={actionUrl} onChange={(e) => setActionUrl(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 outline-none" placeholder="/news/slug or /products/123" />
          </label>
          <label className="text-sm font-medium text-black/70">
            URL ảnh
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 outline-none" placeholder="http://... hoặc /uploads/..." />
          </label>
        </div>

        {error ? <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">{error}</div> : null}
        {status === 'success' ? <div className="px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm border border-green-100">Đã gửi thông báo.</div> : null}

        <div className="flex justify-end gap-3">
          <button type="submit" disabled={status === 'loading'} className="px-5 py-3 rounded-full bg-black text-white text-sm font-semibold disabled:opacity-50">
            {status === 'loading' ? 'Đang gửi...' : 'Gửi thông báo'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminNotificationsPage
