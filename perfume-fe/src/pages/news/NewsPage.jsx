import { useEffect, useMemo, useState } from 'react'
import { FiArrowRight, FiClock, FiSearch, FiUser } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getPublicArticlesApi } from '../../api/articleApi'

const CATEGORY_OPTIONS = [
  { id: '', label: 'Tất cả bài viết' },
  { id: 'Kiến thức nước hoa', label: 'Kiến thức nước hoa' },
  { id: 'Review nước hoa', label: 'Review nước hoa' },
]

const API_BASE = 'http://localhost:8080'

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const normalizeImageUrl = (url = '') => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('data:')) return url
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`
  if (/\.(jpe?g|png|webp|gif|svg)$/i.test(url)) return `${API_BASE}/uploads/${url.replace(/^\/+/, '')}`
  return url
}
const extractFirstImage = (html = '') => {
  const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
  return normalizeImageUrl(match?.[1] || '')
}
const getExcerpt = (article) => {
  const raw = stripHtml(article?.content || '')
  return raw.length > 140 ? `${raw.slice(0, 140)}...` : raw
}

const NewsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [hoveredId, setHoveredId] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const categoryFromUrl = params.get('categoryName') || ''
    if (categoryFromUrl && categoryFromUrl !== activeCategory) {
      setActiveCategory(categoryFromUrl)
    }
  }, [location.search])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getPublicArticlesApi({ q: searchQuery, categoryName: activeCategory })
        setArticles(Array.isArray(data) ? data : [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [searchQuery, activeCategory])

  const items = useMemo(() => articles.map((article) => ({
    ...article,
    thumbnail: normalizeImageUrl(article.thumbnailUrl || extractFirstImage(article.content)),
    excerpt: article.excerpt || getExcerpt(article),
  })), [articles])

  const handleSubmitSearch = (e) => {
    e.preventDefault()
    setSearchQuery(searchInput.trim())
  }

  return (
    <div className="py-10">
      <div className="w-full max-w-7xl px-4 mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold text-black">Tin tức nước hoa</h1>
          <p className="mt-2 text-sm text-black/60">Cập nhật kiến thức, review và góc nhìn mới về thế giới hương thơm.</p>
        </div>

        <div className="mb-6 flex flex-col lg:flex-row lg:items-end gap-3">
          <form onSubmit={handleSubmitSearch} className="flex-1 flex items-center gap-3">
            <label className="flex-1 text-xs font-semibold text-black/50">
              Tìm kiếm bài viết
              <div className="mt-1 flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3">
                <FiSearch className="text-black/40" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Nhập từ khóa..."
                  className="w-full outline-none text-sm"
                />
              </div>
            </label>
            <button type="submit" className="mt-6 px-5 py-3 rounded-2xl bg-black text-white text-sm font-semibold">
              Tìm
            </button>
          </form>

          <label className="text-xs font-semibold text-black/50 min-w-[240px]">
            Danh mục
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-2xl border border-black/10 bg-white text-sm outline-none"
            >
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item.id || 'all'} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="py-20 text-center text-black/55">Đang tải bài viết...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {items.map((article) => {
              const hovered = hoveredId === article.id
              return (
                <motion.article
                  key={article.id}
                  className="group relative overflow-hidden rounded-[26px] bg-white border border-black/5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] cursor-pointer min-h-[520px]"
                  onMouseEnter={() => setHoveredId(article.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.28 }}
                  onClick={() => navigate(`/news/${article.slug}`)}
                >
                  <div className="absolute inset-0">
                    <img
                      src={article.thumbnail || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80'}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/0" />
                  </div>

                  <div className="relative z-10 flex h-full min-h-[520px] flex-col justify-end p-5 md:p-6 text-white">
                    <div className="mb-3 text-xs uppercase tracking-[0.22em] text-white/70">{article.categoryName}</div>
                    <h2 className="text-xl md:text-2xl font-semibold leading-tight line-clamp-3">{article.title}</h2>

                    <motion.div
                      initial={false}
                      animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 14, height: hovered ? 'auto' : 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-sm md:text-[15px] leading-6 text-white/85 line-clamp-4">
                        {article.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-xs text-white/70 flex-wrap">
                        <span className="inline-flex items-center gap-2"><FiUser /> BACK Perfume</span>
                        <span className="inline-flex items-center gap-2"><FiClock /> {article.createdAt}</span>
                      </div>
                      <button
                        type="button"
                        className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/30 bg-white/10 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white hover:text-black transition-colors"
                      >
                        Xem chi tiết <FiArrowRight />
                      </button>
                    </motion.div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default NewsPage
