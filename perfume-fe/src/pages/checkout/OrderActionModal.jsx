import { FiX } from 'react-icons/fi'

const OrderActionModal = ({
  isOpen,
  title,
  description,
  note,
  setNote,
  onClose,
  onConfirm,
  confirmLabel = 'Xác nhận',
  confirmLoading = false,
  children,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6" onClick={onClose}>
      <div className="w-full max-w-md rounded-[24px] bg-white shadow-[0_30px_120px_rgba(0,0,0,0.25)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-black/5">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-black/40">{title}</div>
            <div className="mt-1 text-lg font-semibold text-black">{description}</div>
          </div>
          <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
            <FiX />
          </button>
        </div>
        <div className="p-5">
          {children}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Ghi chú admin (không bắt buộc)"
            className="mt-4 w-full px-4 py-3 text-sm border border-black/10 rounded-2xl outline-none focus:border-black/30 resize-none"
          />
          <div className="mt-4 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-full border border-black/10 text-sm font-semibold text-black">
              Hủy
            </button>
            <button type="button" onClick={onConfirm} disabled={confirmLoading} className="px-4 py-2.5 rounded-full bg-black text-white text-sm font-semibold disabled:opacity-50">
              {confirmLoading ? 'Đang xử lý...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderActionModal
