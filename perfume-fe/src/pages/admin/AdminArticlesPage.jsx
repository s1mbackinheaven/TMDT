import { useEffect, useState } from 'react'
import { FiEye, FiPlus, FiTrash2 } from 'react-icons/fi'
import { createAdminArticleMultipartApi, deleteAdminArticleApi, getAdminArticleDetailApi, getAdminArticlesApi } from '../../api/articleApi'
import ArticleEditorModal from './articles/ArticleEditorModal'
import ArticleDetailModal from './ArticleDetailModal'

const AdminArticlesPage = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAdminArticlesApi()
      setArticles(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (formData) => {
    setSubmitting(true)
    try {
      await createAdminArticleMultipartApi(formData)
      setEditorOpen(false)
      await load()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bài viết này?')) return
    await deleteAdminArticleApi(id)
    await load()
  }

  const openDetail = async (id) => {
    const data = await getAdminArticleDetailApi(id)
    setSelectedArticle(data)
    setDetailOpen(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-black">Quản lý bài viết</h1>
          <p className="text-sm text-black/60 mt-2">Dùng category/tag cố định để tạo nội dung cho admin.</p>
        </div>
        <button type="button" onClick={() => setEditorOpen(true)} className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-black text-white text-sm font-semibold">
          <FiPlus /> Tạo bài viết
        </button>
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-black/5 overflow-hidden">
        {loading ? <div className="p-6 text-sm text-black/60">Đang tải bài viết...</div> : null}
        <div className="divide-y divide-black/5">
          {articles.map((article) => (
            <div key={article.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="font-semibold text-black">{article.title}</div>
                <div className="text-sm text-black/55">{article.categoryName} · {article.tagNames}</div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => openDetail(article.id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-sm font-semibold text-black">
                  <FiEye /> Xem chi tiết
                </button>
                <button type="button" onClick={() => handleDelete(article.id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-sm font-semibold text-black">
                  <FiTrash2 /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ArticleEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleCreate}
        submitting={submitting}
      />

      <ArticleDetailModal
        isOpen={detailOpen}
        article={selectedArticle}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}

export default AdminArticlesPage
