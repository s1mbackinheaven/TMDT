import { useEffect, useMemo, useState } from 'react'
import { FiEye, FiPower, FiX } from 'react-icons/fi'
import { toggleUserStatusApi, getAllUsersApi, getUserByIdApi } from '../../api/userApi'

const EXCLUDED_FIELDS = new Set(['status', 'isVerified'])

const STATUS_LABELS = {
  ACTIVE: 'Đang hoạt động',
  CANCELLED: 'Đã khóa',
}

const ROLE_LABELS = {
  CUSTOMER: 'Khách hàng',
  ADMIN: 'Quản trị viên',
}

const TIER_LABELS = {
  BRONZE: 'Đồng',
  SILVER: 'Bạc',
  GOLD: 'Vàng',
  PLATINUM: 'Bạch kim',
}

const FIELD_LABELS = {
  id: 'Mã (ID)',
  username: 'Tên đăng nhập',
  firstName: 'Họ',
  lastName: 'Tên',
  fullName: 'Họ và tên',
  email: 'Email',
  gender: 'Giới tính',
  phoneNumber: 'Số điện thoại',
  address: 'Địa chỉ',
  role: 'Vai trò',
  loyaltyPoints: 'Điểm tích lũy',
  loyaltyTier: 'Hạng VIP',
  profilePicture: 'Ảnh đại diện',
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [error, setError] = useState('')

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAllUsersApi()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không tải được danh sách user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const activeCount = useMemo(() => users.filter((u) => String(u.status || '').toUpperCase() !== 'CANCELLED').length, [users])

  const openDetail = async (userId) => {
    setDetailLoading(true)
    try {
      const data = await getUserByIdApi(userId)
      setSelectedUser(data)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleToggleStatus = async (user) => {
    setActionLoadingId(user.id)
    setError('')
    try {
      await toggleUserStatusApi(user.id)
      await loadUsers()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thay đổi được trạng thái user')
    } finally {
      setActionLoadingId(null)
    }
  }

  const detailEntries = useMemo(() => {
    if (!selectedUser) return []
    return Object.entries(selectedUser).filter(([key]) => !EXCLUDED_FIELDS.has(key))
  }, [selectedUser])

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-black">Quản trị người dùng</h1>
          <p className="mt-2 text-sm text-black/60">Tổng người dùng: {users.length} · Đang hoạt động: {activeCount}</p>
        </div>
      </div>

      {error ? <div className="mt-4 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">{error}</div> : null}

      <div className="mt-6 bg-white border border-black/5 rounded-2xl overflow-hidden">
        {loading ? <div className="p-6 text-sm text-black/60">Đang tải danh sách user...</div> : null}
        <div className="divide-y divide-black/5">
          {users.map((user) => (
            <div key={user.id} className="p-4 md:p-5 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="font-semibold text-black">{user.fullName || user.username}</div>
                <div className="text-sm text-black/55">
                  {user.email} · {ROLE_LABELS[user.role] || user.role}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${String(user.status || '').toUpperCase() === 'CANCELLED' ? 'bg-rose-50 text-rose-600' : 'bg-black text-white'}`}>
                  {STATUS_LABELS[user.status] || user.status || '—'}
                </span>
                {user.loyaltyTier && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border border-[#b8860b]/30 bg-[#ffd700]/10 text-[#b8860b]">
                    VIP: {TIER_LABELS[user.loyaltyTier] || user.loyaltyTier}
                  </span>
                )}
                <button type="button" onClick={() => openDetail(user.id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-semibold cursor-pointer">
                  <FiEye /> Xem thông tin
                </button>
                <button type="button" onClick={() => handleToggleStatus(user)} disabled={actionLoadingId === user.id} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${String(user.status || '').toUpperCase() === 'CANCELLED' ? 'border-emerald-600/30 text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'border-black/10 text-black hover:bg-black/5'}`}>
                  <FiPower /> {actionLoadingId === user.id ? 'Đang xử lý...' : (String(user.status || '').toUpperCase() === 'CANCELLED' ? 'Mở khóa' : 'Khóa')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-[80vw] max-h-[80vh] overflow-auto rounded-[28px] bg-white shadow-[0_30px_120px_rgba(0,0,0,0.25)]" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between px-6 py-5 border-b border-black/5 bg-white/95 backdrop-blur">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-black/40">Chi tiết người dùng</div>
                <div className="mt-1 text-2xl font-semibold text-black">{selectedUser.fullName || selectedUser.username}</div>
              </div>
              <button type="button" onClick={() => setSelectedUser(null)} className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center">
                <FiX />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {detailEntries.map(([key, value]) => (
                <div key={key} className="p-4 rounded-2xl bg-[#fafafa] border border-black/5">
                  <div className="text-xs uppercase tracking-[0.2em] text-black/40">{FIELD_LABELS[key] || key}</div>
                  <div className="mt-2 text-sm font-semibold text-black break-words">{formatValue(value, key)}</div>
                </div>
              ))}
            </div>
            {detailLoading ? <div className="p-6 text-sm text-black/50">Đang tải...</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

const formatGender = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return '—'
  if (['male', 'man', 'm', 'nam'].includes(normalized)) return 'Nam'
  if (['female', 'woman', 'f', 'nu', 'nữ'].includes(normalized)) return 'Nữ'
  if (['other', 'others', 'khac', 'khác'].includes(normalized)) return 'Khác'
  return String(value)
}

const formatValue = (value, key) => {
  if (key === 'gender') return formatGender(value)
  if (key === 'role') return ROLE_LABELS[value] || value
  if (key === 'status') return STATUS_LABELS[value] || value
  if (key === 'loyaltyTier') return TIER_LABELS[value] || value
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Có' : 'Không'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export default AdminUsersPage
