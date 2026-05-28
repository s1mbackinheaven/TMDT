import { useEffect, useMemo, useRef, useState } from 'react'
import { FiImage, FiX } from 'react-icons/fi'

const CATEGORY_OPTIONS = ['Kiến thức nước hoa', 'Review nước hoa']
const TAG_OPTIONS = ['Hướng dẫn', 'Đánh giá']

const ArticleEditorModal = ({
  isOpen,
  onClose,
  onSubmit,
  submitting = false,
}) => {
  const editorRef = useRef(null)
  const contentImageInputRef = useRef(null)
  const thumbnailInputRef = useRef(null)
  const [title, setTitle] = useState('')
  const [categoryName, setCategoryName] = useState(CATEGORY_OPTIONS[0])
  const [tagNames, setTagNames] = useState([TAG_OPTIONS[0]])
  const [status, setStatus] = useState('PUBLISHED')
  const [featured, setFeatured] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  const [contentImageFiles, setContentImageFiles] = useState([])
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setTitle('')
    setCategoryName(CATEGORY_OPTIONS[0])
    setTagNames([TAG_OPTIONS[0]])
    setStatus('PUBLISHED')
    setFeatured(false)
    setHtmlContent('')
    setContentImageFiles([])
    setThumbnailFile(null)
    setThumbnailPreview('')
    if (editorRef.current) editorRef.current.innerHTML = ''
  }, [isOpen])

  const plainText = useMemo(() => stripHtml(htmlContent), [htmlContent])

  const exec = (command, value = null) => {
    document.execCommand(command, false, value)
    syncEditor()
  }

  const syncEditor = () => {
    if (!editorRef.current) return
    setHtmlContent(editorRef.current.innerHTML)
  }

  const handleInput = () => syncEditor()

  const insertImage = async (files) => {
    const picked = Array.from(files || [])
    if (!picked.length) return
    setContentImageFiles((prev) => [...prev, ...picked])
    for (const file of picked) {
      const dataUrl = await readFileAsDataUrl(file)
      const img = `<p><img src="${dataUrl}" alt="article-image" style="max-width:100%;border-radius:16px;" /></p>`
      document.execCommand('insertHTML', false, img)
    }
    syncEditor()
  }

  const handleThumbnailPick = async (files) => {
    const file = files?.[0]
    if (!file) return
    setThumbnailFile(file)
    setThumbnailPreview(await readFileAsDataUrl(file))
  }

  const toggleTag = (tag) => {
    setTagNames((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]))
  }

  const handleSubmit = () => {
    const text = stripHtml(htmlContent).trim()
    if (!title.trim() || !text || !categoryName || !tagNames.length || !thumbnailFile) return

    const payload = {
      title: title.trim(),
      content: htmlContent,
      categoryName,
      tagNames: tagNames.join(', '),
      status,
      featured,
    }

    const formData = new FormData()
    formData.append('request', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
    formData.append('images', thumbnailFile)
    contentImageFiles.forEach((file) => formData.append('images', file))
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6" onClick={onClose}>
      <div className="w-full max-w-6xl max-h-[92vh] overflow-auto rounded-[28px] bg-white shadow-[0_30px_120px_rgba(0,0,0,0.25)]" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-5 border-b border-black/5 bg-white/95 backdrop-blur">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-black/40">Bài viết</div>
            <div className="mt-1 text-2xl font-semibold text-black">Tạo bài viết mới</div>
          </div>
          <button type="button" onClick={onClose} className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center"><FiX /></button>
        </div>

        <div className="p-6 grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
              <label className="text-xs font-semibold text-black/50">
                Thumbnail avatar
                <div className="mt-1 rounded-2xl border border-black/10 p-3 bg-white">
                  <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleThumbnailPick(e.target.files)} />
                  <button type="button" onClick={() => thumbnailInputRef.current?.click()} className="w-full aspect-[3/4] rounded-2xl border border-dashed border-black/15 overflow-hidden flex items-center justify-center bg-black/[0.02]">
                    {thumbnailPreview ? <img src={thumbnailPreview} alt="thumbnail" className="w-full h-full object-cover" /> : <span className="text-xs text-black/45">Chọn ảnh thumbnail</span>}
                  </button>
                </div>
              </label>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-black/50">Tiêu đề</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 outline-none" placeholder="Nhập tiêu đề bài viết" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="text-xs font-semibold text-black/50">
                    Category
                    <select value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 outline-none bg-white">
                      {CATEGORY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-black/50">
                    Trạng thái
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 outline-none bg-white">
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-black/50 mb-2">Tags</div>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => {
                  const active = tagNames.includes(tag)
                  return (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-3 py-2 rounded-full text-xs font-semibold border ${active ? 'bg-black text-white border-black' : 'bg-white border-black/10 text-black'}`}>
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-black">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Nổi bật
              </label>
            </div>

            <div className="rounded-2xl border border-black/10 overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 p-3 border-b border-black/5 bg-black/[0.02]">
                <ToolbarButton label="B" onClick={() => exec('bold')} title="In đậm" />
                <ToolbarButton label="I" onClick={() => exec('italic')} title="In nghiêng" />
                <ToolbarButton label="UL" onClick={() => exec('insertUnorderedList')} title="Danh sách" />
                <ToolbarButton label="Link" onClick={() => {
                  const url = window.prompt('Nhập URL')
                  if (url) exec('createLink', url)
                }} title="Chèn link" />
                <ToolbarButton label="Ảnh" onClick={() => contentImageInputRef.current?.click()} title="Chèn ảnh" />
                <input ref={contentImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => insertImage(e.target.files)} />
              </div>

              <div className="p-4">
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleInput}
                  onPaste={(e) => {
                    const files = Array.from(e.clipboardData?.files || [])
                    if (files.length) {
                      e.preventDefault()
                      insertImage(files)
                    }
                  }}
                  onDrop={(e) => {
                    const files = Array.from(e.dataTransfer?.files || [])
                    if (files.length) {
                      e.preventDefault()
                      insertImage(files)
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  className="min-h-[420px] rounded-2xl border border-black/10 px-4 py-3 outline-none prose max-w-none"
                  style={{ whiteSpace: 'pre-wrap' }}
                  data-placeholder="Soạn nội dung bài viết ở đây..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#fafafa] border border-black/5">
              <div className="text-xs uppercase tracking-[0.2em] text-black/40">Hướng dẫn</div>
              <ul className="mt-3 text-sm text-black/65 space-y-2 list-disc pl-5">
                <li>Bấm toolbar để in đậm, nghiêng, tạo list hoặc chèn link.</li>
                <li>Kéo thả hoặc paste ảnh trực tiếp vào vùng soạn thảo.</li>
                <li>Category và tag là droplist cố định lấy từ FE.</li>
                <li>Thumbnail avatar là ảnh chính dùng cho card và detail.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-[#fafafa] border border-black/5">
              <div className="text-xs uppercase tracking-[0.2em] text-black/40">Kiểm tra nhanh</div>
              <div className="mt-2 text-sm text-black/70">Số ký tự: {plainText.length}</div>
              <div className="mt-2 text-sm text-black/70 break-words">Tags: {tagNames.join(', ') || '—'}</div>
              <div className="mt-2 text-sm text-black/70 break-words">Category: {categoryName}</div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-3 rounded-full border border-black/10 text-sm font-semibold text-black">Hủy</button>
              <button type="button" onClick={handleSubmit} disabled={submitting} className="px-4 py-3 rounded-full bg-black text-white text-sm font-semibold disabled:opacity-50">{submitting ? 'Đang tạo...' : 'Tạo bài viết'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ToolbarButton = ({ label, onClick, title }) => (
  <button type="button" onClick={onClick} title={title} className="px-3 py-2 rounded-lg border border-black/10 text-sm font-semibold hover:bg-black hover:text-white transition-colors">
    {label}
  </button>
)

const stripHtml = (html) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

export default ArticleEditorModal
