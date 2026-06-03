import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProductsApi } from '../../api/productsApi'

const HomeProductCard = ({ product, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center justify-between w-full h-[360px] bg-white p-6 cursor-pointer group hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all duration-300"
    >
      <div className="w-full flex justify-end h-8">
        <span className="text-[10px] md:text-[11px] font-medium tracking-widest uppercase text-black/60 text-right line-clamp-2 max-w-[100px] leading-tight">
          {product.brandName || ''}
        </span>
      </div>
      
      <div className="flex-1 w-full flex items-center justify-center my-4 overflow-hidden relative">
        <img 
          src={product.thumbnail} 
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </div>

      <div className="w-full text-center mt-auto pt-2">
        <h3 className="text-sm font-medium text-black line-clamp-1">{product.name}</h3>
        <p className="mt-1.5 text-xs text-black/60">{product.minPrice ? `${new Intl.NumberFormat('vi-VN').format(product.minPrice)} đ` : 'Liên hệ'}</p>
      </div>
    </div>
  )
}

const HomeBestSellerSection = () => {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const scrollRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [dotsCount, setDotsCount] = useState(0)

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const res = await getProductsApi({
          page: 0,
          size: 12,
          sortBy: 'createdAt',
          sortDir: 'desc',
        })
        setData(res)
      } catch (err) {
        setErrorMessage(
          err?.response?.data?.message ||
            'Không tải được danh sách sản phẩm. Vui lòng thử lại.'
        )
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const products = data?.content || []

  useEffect(() => {
    const updateDots = () => {
      if (scrollRef.current && products.length > 0) {
        const { scrollWidth, clientWidth } = scrollRef.current
        if (scrollWidth > clientWidth) {
          // Lấy số lượng page xấp xỉ
          setDotsCount(Math.ceil(scrollWidth / clientWidth))
        } else {
          setDotsCount(0)
        }
      }
    }
    
    // Đợi render xong để lấy kích thước chính xác
    setTimeout(updateDots, 100)
    window.addEventListener('resize', updateDots)
    return () => window.removeEventListener('resize', updateDots)
  }, [products])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    const index = Math.round(scrollLeft / clientWidth)
    setActiveIndex(index)
  }

  const scrollTo = (index) => {
    if (!scrollRef.current) return
    const { clientWidth } = scrollRef.current
    scrollRef.current.scrollTo({
      left: index * clientWidth,
      behavior: 'smooth'
    })
  }

  const handleGoDetail = (id) => {
    navigate(`/products/${id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!products.length && isLoading === false && !errorMessage) return null

  return (
    <section className="relative w-full bg-[#FAFAFA] py-16 md:py-20 overflow-hidden">
      <div className="w-full max-w-[1300px] px-4 md:px-8 mx-auto relative z-10">
        <h2 className="text-2xl md:text-3xl font-medium text-black text-center mb-12">
          Sản phẩm bán chạy
        </h2>

        {isLoading ? (
          <p className="text-sm text-black/60 text-center">Đang tải sản phẩm...</p>
        ) : errorMessage ? (
          <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center">
            {errorMessage}
          </div>
        ) : (
          <div className="relative">
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8"
            >
              {products.map((p) => (
                <div key={p.id} className="w-[85vw] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] snap-start flex-shrink-0">
                  <HomeProductCard product={p} onClick={() => handleGoDetail(p.id)} />
                </div>
              ))}
            </div>

            {/* Pagination Dots */}
            {dotsCount > 1 && (
              <div className="flex justify-center items-center gap-2 mt-2">
                {Array.from({ length: dotsCount }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeIndex ? 'w-6 bg-black' : 'w-1.5 bg-black/20 hover:bg-black/40'
                    }`}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default HomeBestSellerSection
