import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getProductsApi } from '../../api/productsApi'
import { useNavigate } from 'react-router-dom'

const ProductShowcaseSection = () => {
  const [products, setProducts] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchHighlightProducts = async () => {
      try {
        const res = await getProductsApi({ page: 0, size: 3 })
        if (res?.content?.length > 0) {
          setProducts(res.content)
        }
      } catch (error) {
        console.error('Failed to fetch highlight products', error)
      }
    }
    fetchHighlightProducts()
  }, [])

  if (products.length === 0) return null

  const activeProduct = products[activeIndex]

  return (
    <section className="relative w-full bg-white py-20 overflow-hidden border-b border-black/5">
      
      <div className="w-full max-w-[1100px] mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-10 md:gap-16">
          
          {/* Left: Main Image */}
          <div className="w-full md:w-[45%] flex justify-center items-center h-[350px] md:h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative w-full h-full flex justify-center items-center"
              >
                <img 
                  src={activeProduct.thumbnail} 
                  alt={activeProduct.name}
                  className="max-h-full max-w-full object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.2)]"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Info and Thumbnails */}
          <div className="w-full md:w-[55%] flex flex-col justify-center pt-8 md:pt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-start"
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-black max-w-md leading-[1.15]">
                  {activeProduct.name}
                </h2>
                <p className="mt-6 text-[#7a7a7a] text-sm md:text-sm leading-relaxed max-w-md font-light">
                  {activeProduct.description || `${activeProduct.name} mang đến cảm giác sang trọng và lôi cuốn với hương thơm độc đáo, hòa quyện nhẹ nhàng trên nền gỗ đàn hương, tạo nên dư vị quyến rũ và kéo dài trên làn da.`}
                </p>
                <button
                  onClick={() => navigate(`/products/${activeProduct.id}`)}
                  className="mt-8 flex items-center gap-3 px-6 py-2 rounded-full border border-black text-black hover:bg-black hover:text-white transition-colors duration-300 text-sm"
                >
                  Mua ngay <span>→</span>
                </button>
              </motion.div>
            </AnimatePresence>

            {/* Thumbnails Row */}
            <div className="mt-auto pt-16 flex items-start gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {products.map((p, idx) => {
                const isActive = idx === activeIndex
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveIndex(idx)}
                    className="flex flex-col items-start gap-3 cursor-pointer group w-[85px] md:w-[95px] flex-shrink-0"
                  >
                    <div className={`w-full aspect-[4/5] bg-white border flex items-center justify-center p-3 transition-all duration-300 ${isActive ? 'border-black/5 shadow-sm' : 'border-black/5 opacity-60 hover:opacity-100'}`}>
                      <img 
                        src={p.thumbnail} 
                        alt={p.name} 
                        className={`max-h-full max-w-full object-contain transition-transform duration-500 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}
                      />
                    </div>
                    <div className={`w-full text-left pb-2 border-b-[1.5px] transition-colors duration-300 ${isActive ? 'border-black' : 'border-transparent group-hover:border-black/20'}`}>
                      <p className={`text-[11px] leading-[1.3] ${isActive ? 'text-black font-medium' : 'text-[#A0A0A0] font-normal'}`}>
                        {p.name}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}

export default ProductShowcaseSection
