// src/components/home/FeatureMarquee.jsx
import { motion } from 'framer-motion'

const ITEMS = [
  'Chất lượng',
  'Hỗ trợ nhanh chóng',
  'Thanh toán tiện lợi',
  'Giao hàng nhanh',
  'Đảm bảo chất lượng',
  'Hỗ trợ nhanh chóng',
  'Thanh toán tiện lợi',
  'Giao hàng nhanh',
]

const FeatureMarquee = () => {
  // Dùng framer-motion để tạo hiệu ứng marquee chạy ngang lặp vô hạn
  const loopItems = [...ITEMS, ...ITEMS]

  return (
    <section className="relative w-full bg-black text-white border-t border-b border-white/10">
      <div className="overflow-hidden py-3 md:py-4">
        <motion.div
          className="flex items-center gap-12 md:gap-20 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 22,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          {loopItems.map((label, index) => (
            <div
              key={`${label}-${index}`}
              className="flex items-center gap-3 text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/80 cursor-default"
            >
              <span>{label}</span>
              <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default FeatureMarquee

