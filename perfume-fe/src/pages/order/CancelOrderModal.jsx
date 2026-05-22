import { useMemo, useState } from 'react'
import { FiX } from 'react-icons/fi'

const COMMON_REASONS = [
  'Đặt nhầm sản phẩm',
  'Đặt nhầm số lượng',
  'Đổi ý, không muốn mua nữa',
  'Muốn đổi sang sản phẩm khác',
  'Giao hàng quá lâu',
]

const CancelOrderModal = ({ isOpen, onClose, onConfirm, loading = false }) => {
  const [selectedReason, setSelectedReason] = useState('')
  const [otherReason, setOtherReason] = useState('')

  const note = useMemo(() => {
    if (selectedReason === 'other') return otherReason.trim()
    return selectedReason
  }, [selectedReason, otherReason])

  const handleConfirm = () => {
    if (!note) return
    onConfirm(note)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6" onClick={onClose}>
      <div className="w-full max-w-md rounded-[24px] bg-white shadow-[0_30px_120px_rgba(0,0,0,0.25)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-black/5">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-black/40">Hủy đơn hàng</div>
            <div className="mt-1 text-lg font-semibold text-black">Chọn lý do hủy</div>
          </div>
          <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
            <FiX />
          </button>
        </div>

        <div className="p-5">
          <div className="space-y-2">
            {COMMON_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => {
                  setSelectedReason(reason)
                  setOtherReason('')
                }}
                className={`w-full text-left px-4 py-3 rounded-2xl border text-sm transition-colors ${selectedReason === reason ? 'border-black bg-black text-white' : 'border-black/10 hover:bg-black/5'}`}
              >
                {reason}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedReason('other')}
              className={`w-full text-left px-4 py-3 rounded-2xl border text-sm transition-colors ${selectedReason === 'other' ? 'border-black bg-black text-white' : 'border-black/10 hover:bg-black/5'}`}
            >
              Khác
            </button>
          </div>

          {selectedReason === 'other' ? (
            <textarea
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              placeholder="Nhập lý do khác"
              rows={3}
              className="mt-3 w-full px-4 py-3 text-sm border border-black/10 rounded-2xl outline-none focus:border-black/30 resize-none"
            />
          ) : null}

          <div className="mt-4 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-full border border-black/10 text-sm font-semibold text-black">
              Hủy
            </button>
            <button type="button" onClick={handleConfirm} disabled={!note || loading} className="px-4 py-2.5 rounded-full bg-black text-white text-sm font-semibold disabled:opacity-50">
              {loading ? 'Đang xử lý...' : 'Xác nhận hủy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CancelOrderModal
