import { motion } from 'framer-motion'

const formatVnd = (value) => {
  if (value === null || value === undefined) return 'Liên hệ'
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ'
}

const ProductCard = ({ product, onClick }) => {
  const { name, thumbnail, brandName, minPrice } = product || {}

  return (
    <motion.button
      type="button"
      className="relative flex flex-col items-center justify-center w-full bg-white border border-black/5 rounded-2xl overflow-hidden cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <div className="relative w-full bg-[#f2f2f2]">
        <motion.img
          src={thumbnail}
          alt={name}
          className="block w-full aspect-square object-contain"
          loading="lazy"
          whileHover={{ rotate: 2.5, x: 4 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        />

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative z-10 px-7 py-2.5 text-sm font-semibold text-white bg-black rounded-full">
            Xem chi tiết
          </div>
        </motion.div>
      </div>

      <div className="w-full px-4 py-4 text-center">
        <p className="text-xs tracking-[0.25em] uppercase text-black/50">
          {brandName || '—'}
        </p>
        <h3 className="mt-2 text-sm font-semibold text-black line-clamp-2">
          {name}
        </h3>
        <p className="mt-2 text-sm text-black/70">{formatVnd(minPrice)}</p>
      </div>
    </motion.button>
  )
}

export default ProductCard

