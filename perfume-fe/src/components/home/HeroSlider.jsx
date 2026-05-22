// src/components/home/HeroSlider.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const SLIDES = [
  {
    id: 1,
    title: 'BACK Perfume',
    subtitle: 'Bộ sưu tập nước hoa',
    description:
      'Chúng tôi tin rằng mọi thứ xuất phát từ đam mê và khát vọng cá nhân là chìa khóa dẫn đến thành công. Lan Perfume mong muốn lan tỏa nguồn năng lượng tích cực này đến với mọi người.',
    imageUrl:
      'https://lanperfume.com/wp-content/uploads/2025/09/banner.zip-1.jpg',
  },
  {
    id: 2,
    title: 'Nghệ thuật mùi hương',
    subtitle: 'Trải nghiệm đa tầng hương',
    description:
      'Mỗi chai nước hoa là một câu chuyện riêng, được chắt lọc từ những tầng hương tinh tế dành cho người yêu cái đẹp và sự tinh chỉnh trong từng chi tiết.',
    imageUrl:
      'https://lanperfume.com/wp-content/uploads/2025/11/banner-home-lanperfume.jpg',
  },
  {
    id: 3,
    title: 'Phong cách cá nhân',
    subtitle: 'Dấu ấn riêng của bạn',
    description:
      'Chúng tôi tin rằng mùi hương là một phần của phong cách. BACK Perfume giúp bạn tìm ra “signature scent” mang đậm cá tính cá nhân.',
    imageUrl:
      'https://lanperfume.com/wp-content/uploads/2025/11/bannerhome-lanperfume.jpg',
  },
]

const HeroSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto slide đơn giản, chỉ đổi index sau mỗi vài giây
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length)
    }, 8000)

    return () => clearInterval(intervalId)
  }, [])

  const currentSlide = SLIDES[currentIndex]

  const handleGoToSlide = (index) => {
    setCurrentIndex(index)
  }

  return (
    <section className="relative h-[520px] md:h-[620px] lg:h-[720px] overflow-hidden">
      {/* Background image có animation đơn giản */}
      <motion.div
        key={currentSlide.id}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${currentSlide.imageUrl}")` }}
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {/* Lớp overlay tối + gradient để chữ nổi bật */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />

      {/* Nội dung hero */}
      <div className="relative z-10 flex items-center h-full max-w-6xl px-6 md:px-10 lg:px-16 mx-auto">
        <motion.div
          key={currentSlide.id}
          className="max-w-xl space-y-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="uppercase tracking-[0.25em] text-xs md:text-sm text-white/70">
            {currentSlide.subtitle}
          </p>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-wide text-white">
            {currentSlide.title}
          </h1>

          <p className="mt-2 text-sm md:text-base leading-relaxed text-white/80">
            {currentSlide.description}
          </p>

          <div className="flex items-center gap-4 mt-6">
            <button className="inline-flex items-center justify-center px-6 py-2 md:px-7 md:py-2.5 text-sm md:text-base font-medium text-black bg-white rounded-full cursor-pointer hover:bg-white/90 transition-colors">
              Mua ngay
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 text-xs md:text-sm text-white border border-white/40 rounded-full cursor-pointer hover:bg-white/10 transition-colors">
              Khám phá thêm
            </button>
          </div>
        </motion.div>
      </div>

      {/* Chỉ số slide bên phải (1 2 3) */}
      <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 text-white/60">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentIndex
          return (
            <button
              key={slide.id}
              onClick={() => handleGoToSlide(index)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <span
                className={`text-xs md:text-sm tracking-[0.3em] ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                  }`}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span
                className={`w-px h-8 md:h-10 ${isActive ? 'bg-white' : 'bg-white/40 group-hover:bg-white/70'
                  }`}
              />
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default HeroSlider