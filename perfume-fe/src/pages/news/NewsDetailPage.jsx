import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiClock, FiUser } from 'react-icons/fi'
import { getPublicArticleBySlugApi, getPublicArticlesApi } from '../../api/articleApi'

import { motion } from 'framer-motion'

const API_BASE = 'http://localhost:8080'
const normalizeImageUrl = (url = '') => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`
  return url
}

const formatVietnamDateTime = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value))
}

const NewsDetailPage = () => {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])

  useEffect(() => {
    // Scroll lên đầu trang khi vào detail
    window.scrollTo(0, 0)
    
    const load = async () => {
      const data = await getPublicArticleBySlugApi(slug)
      setArticle(data)
      const all = await getPublicArticlesApi({ q: '', categoryName: data.categoryName })
      setRelated(Array.isArray(all) ? all.filter((item) => item.slug !== slug).slice(0, 4) : [])
    }
    load()
  }, [slug])

  const title = useMemo(() => article?.title || '', [article])

  if (!article) return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
      className="py-20 text-center text-black/55"
    >
      Đang tải bài viết...
    </motion.div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="py-10"
    >
      <div className="w-full max-w-5xl px-4 mx-auto">
        <Link to="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-black/70 hover:text-black transition-colors">
          <FiArrowLeft /> Quay lại tin tức
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="mt-5 rounded-[28px] overflow-hidden bg-white border border-black/5 shadow-[0_18px_60px_rgba(0,0,0,0.06)]"
        >
          <div className="p-6 md:p-8 border-b border-black/5">
            <div className="text-xs uppercase tracking-[0.22em] text-black/45 font-medium">{article.categoryName}</div>
            <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold text-black leading-tight">{title}</h1>
            <div className="mt-5 flex items-center gap-6 text-[13px] text-black/55 flex-wrap uppercase tracking-wide">
              <span className="inline-flex items-center gap-2"><FiUser /> BACK Perfume</span>
              <span className="inline-flex items-center gap-2"><FiClock /> {formatVietnamDateTime(article.createdAt)}</span>
              {article.tagNames && <span className="inline-flex items-center gap-2">Tags: {article.tagNames}</span>}
            </div>
          </div>

          <div className="p-6 md:p-10">
            <div className="prose prose-lg max-w-none text-black/80 prose-headings:font-semibold prose-a:text-blue-600" dangerouslySetInnerHTML={{ __html: article.content || '' }} />
          </div>
        </motion.div>

        {related.length ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-semibold text-black">Bài viết cùng chủ đề</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {related.map((item) => (
                <Link key={item.id} to={`/news/${item.slug}`} className="group rounded-[20px] bg-white border border-black/5 p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                  <div className="font-semibold text-lg text-black group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</div>
                  <div className="mt-3 text-[15px] leading-relaxed text-black/60 line-clamp-2">{item.excerpt || ''}</div>
                </Link>
              ))}
            </div>
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  )
}

export default NewsDetailPage
