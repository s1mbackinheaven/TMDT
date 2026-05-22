import { motion } from 'framer-motion'

const AuthLoadingOverlay = ({ isOpen, title = 'Đang đăng nhập...' }) => {
  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-[320px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] px-6 py-6 text-center"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-center">
          <motion.div
            className="w-10 h-10 border-2 border-black/15 border-t-black rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, ease: 'linear', repeat: Infinity }}
          />
        </div>

        <p className="mt-4 text-sm font-semibold text-black">{title}</p>
        <p className="mt-1 text-xs text-black/60">Vui lòng chờ trong giây lát</p>
      </motion.div>
    </motion.div>
  )
}

export default AuthLoadingOverlay