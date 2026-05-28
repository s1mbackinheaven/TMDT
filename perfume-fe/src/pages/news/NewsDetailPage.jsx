import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiClock, FiUser } from 'react-icons/fi'
import { getPublicArticleBySlugApi, getPublicArticlesApi } from '../../api/articleApi'

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
    const load = async () => {
      const data = await getPublicArticleBySlugApi(slug)
      setArticle(data)
      const all = await getPublicArticlesApi({ q: '', categoryName: data.categoryName })
      setRelated(Array.isArray(all) ? all.filter((item) => item.slug !== slug).slice(0, 4) : [])
    }
    load()
  }, [slug])

  const title = useMemo(() => article?.title || '', [article])

  if (!article) return <div className="py-20 text-center text-black/55">Đang tải bài viết...</div>

  return (
    <div className="py-10">
      <div className="w-full max-w-5xl px-4 mx-auto">
        <Link to="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-black/70 hover:text-black">
          <FiArrowLeft /> Quay lại tin tức
        </Link>

        <div className="mt-5 rounded-[28px] overflow-hidden bg-white border border-black/5 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
          <div className="p-6 md:p-8 border-b border-black/5">
            <div className="text-xs uppercase tracking-[0.22em] text-black/45">{article.categoryName}</div>
            <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-black leading-tight">{title}</h1>
            <div className="mt-4 flex items-center gap-5 text-xs text-black/55 flex-wrap">
              <span className="inline-flex items-center gap-2"><FiUser /> BACK Perfume</span>
              <span className="inline-flex items-center gap-2"><FiClock /> {formatVietnamDateTime(article.createdAt)}</span>
              <span className="inline-flex items-center gap-2">Tags: {article.tagNames}</span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="prose prose-lg max-w-none text-black" dangerouslySetInnerHTML={{ __html: article.content || '' }} />
          </div>
        </div>

        {related.length ? (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-black">Bài viết cùng chủ đề</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {related.map((item) => (
                <Link key={item.id} to={`/news/${item.slug}`} className="rounded-2xl bg-white border border-black/5 p-4 hover:shadow-lg transition-shadow">
                  <div className="font-semibold text-black">{item.title}</div>
                  <div className="mt-2 text-sm text-black/60">{item.excerpt || ''}</div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default NewsDetailPage
