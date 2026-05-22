import { createContext, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

const genId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const pushToast = (message, type = 'success') => {
    const id = genId()
    setToasts((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => removeToast(id), 2800)
  }

  const value = useMemo(() => ({ pushToast }), [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-5 right-5 z-60 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto min-w-[280px] max-w-[360px] px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-black text-white border-black/10'
            }`}
          >
            <p className="text-sm font-semibold">{toast.type === 'error' ? 'Thông báo lỗi' : 'Đã thêm vào giỏ hàng'}</p>
            <p className="mt-1 text-sm leading-relaxed">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
