import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getProductsApi } from '../../api/productsApi'
import ProductCard from '../../pages/products/components/ProductCard'

const HomeBestSellerSection = () => {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        // Lấy danh sách sản phẩm mới nhất, dùng lại API list sản phẩm
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

  const handleGoDetail = (id) => {
    navigate(`/products/${id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!products.length && isLoading === false && !errorMessage) return null

  return (
    <section className="w-full bg-[#f5f5f5] py-10 md:py-14">
      <div className="w-full max-w-[1200px] px-4 md:px-10 lg:px-16 mx-auto">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-semibold text-black">
            Sản phẩm bán chạy
          </h2>
          <button
            type="button"
            className="hidden md:inline-flex items-center justify-center px-4 py-2 text-xs md:text-sm font-semibold text-black bg-white border border-black/10 rounded-full cursor-pointer hover:bg-black/5 transition-colors"
            onClick={() => {
              navigate('/products')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            Xem tất cả
          </button>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-black/60">Đang tải sản phẩm...</p>
        ) : errorMessage ? (
          <div className="mt-6 px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {errorMessage}
          </div>
        ) : (
          <motion.div
            className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
          >
            {products.map((p) => (
              <motion.div
                key={p.id}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: 'easeOut' },
                  },
                }}
              >
                <ProductCard product={p} onClick={() => handleGoDetail(p.id)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default HomeBestSellerSection

