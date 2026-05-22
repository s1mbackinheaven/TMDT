import { useEffect, useMemo, useState } from 'react'
import { FiEye, FiPower, FiX } from 'react-icons/fi'
import { deactivateUserApi, getAllUsersApi, getUserByIdApi } from '../../api/userApi'

const EXCLUDED_FIELDS = new Set(['status', 'isVerified'])

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

  const handleDeactivate = async (userId) => {
    const reason = window.prompt('Nhập lý do deactive user này')
    if (!reason || !reason.trim()) return
    setActionLoadingId(userId)
    setError('')
    try {
      await deactivateUserApi(userId, { reason: reason.trim() })
      await loadUsers()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không deactive được user')
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
          <p className="mt-2 text-sm text-black/60">Tổng user: {users.length} · Đang hoạt động: {activeCount}</p>
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
                  {user.email} · {user.role}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black text-white">{user.status || '—'}</span>
                <button type="button" onClick={() => openDetail(user.id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-semibold cursor-pointer">
                  <FiEye /> Xem thông tin
                </button>
                <button type="button" onClick={() => handleDeactivate(user.id)} disabled={actionLoadingId === user.id} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-sm font-semibold text-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <FiPower /> {actionLoadingId === user.id ? 'Đang xử lý...' : 'Deactive'}
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
                <div className="text-xs uppercase tracking-[0.25em] text-black/40">User detail</div>
                <div className="mt-1 text-2xl font-semibold text-black">{selectedUser.fullName || selectedUser.username}</div>
              </div>
              <button type="button" onClick={() => setSelectedUser(null)} className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center">
                <FiX />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {detailEntries.map(([key, value]) => (
                <div key={key} className="p-4 rounded-2xl bg-[#fafafa] border border-black/5">
                  <div className="text-xs uppercase tracking-[0.2em] text-black/40">{key}</div>
                  <div className="mt-2 text-sm font-semibold text-black break-words">{formatValue(value)}</div>
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

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Có' : 'Không'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export default AdminUsersPage
