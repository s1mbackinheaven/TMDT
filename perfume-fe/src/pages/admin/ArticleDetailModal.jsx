import { FiX } from 'react-icons/fi'

const ArticleDetailModal = ({ isOpen, article, onClose }) => {
  if (!isOpen || !article) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[90vh] overflow-auto rounded-[28px] bg-white shadow-[0_30px_120px_rgba(0,0,0,0.25)]" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-5 border-b border-black/5 bg-white/95 backdrop-blur">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-black/40">Chi tiết bài viết</div>
            <div className="mt-1 text-2xl font-semibold text-black">{article.title}</div>
          </div>
          <button type="button" onClick={onClose} className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center">
            <FiX />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard label="Category" value={article.categoryName} />
            <InfoCard label="Tags" value={article.tagNames} />
            <InfoCard label="Slug" value={article.slug} />
            <InfoCard label="Trạng thái" value={article.status} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard label="Nổi bật" value={article.featured ? 'Có' : 'Không'} />
            <InfoCard label="Ngày tạo" value={article.createdAt} />
          </div>
          {article.coverImageUrl ? (
            <div className="rounded-3xl overflow-hidden border border-black/5">
              <img src={article.coverImageUrl} alt={article.title} className="w-full max-h-80 object-cover" />
            </div>
          ) : null}
          <div className="p-5 rounded-3xl bg-[#fafafa] border border-black/5">
            <div className="text-xs uppercase tracking-[0.2em] text-black/40">Nội dung</div>
            <div className="mt-3 prose prose-sm max-w-none text-black" dangerouslySetInnerHTML={{ __html: article.content || '' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

const InfoCard = ({ label, value }) => (
  <div className="p-4 rounded-2xl bg-[#fafafa] border border-black/5">
    <div className="text-xs uppercase tracking-[0.2em] text-black/40">{label}</div>
    <div className="mt-2 text-sm font-semibold text-black break-words">{value || '—'}</div>
  </div>
)

export default ArticleDetailModal
