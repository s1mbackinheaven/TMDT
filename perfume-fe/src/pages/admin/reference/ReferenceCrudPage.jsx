import { useEffect, useMemo, useState } from 'react'
import {
  getBrandsApi,
  getCategoriesApi,
  getCollectionsApi,
  getScentFamiliesApi,
  getTagsApi,
} from '../../../api/filtersApi'
import {
  createBrandApi,
  createCategoryApi,
  createCollectionApi,
  createScentFamilyApi,
  createTagApi,
  deleteBrandApi,
  deleteCategoryApi,
  deleteCollectionApi,
  deleteScentFamilyApi,
  deleteTagApi,
  updateBrandApi,
  updateCategoryApi,
  updateCollectionApi,
  updateScentFamilyApi,
  updateTagApi,
} from '../../../api/referenceAdminApi'

const ENTITY_MAP = {
  brands: {
    title: 'Brands',
    listApi: getBrandsApi,
    createApi: createBrandApi,
    updateApi: updateBrandApi,
    deleteApi: deleteBrandApi,
    hasParent: false,
  },
  tags: {
    title: 'Tags',
    listApi: getTagsApi,
    createApi: createTagApi,
    updateApi: updateTagApi,
    deleteApi: deleteTagApi,
    hasParent: false,
  },
  collections: {
    title: 'Collections',
    listApi: getCollectionsApi,
    createApi: createCollectionApi,
    updateApi: updateCollectionApi,
    deleteApi: deleteCollectionApi,
    hasParent: false,
  },
  'scent-families': {
    title: 'Scent families',
    listApi: getScentFamiliesApi,
    createApi: createScentFamilyApi,
    updateApi: updateScentFamilyApi,
    deleteApi: deleteScentFamilyApi,
    hasParent: false,
  },
  categories: {
    title: 'Categories',
    listApi: getCategoriesApi,
    createApi: createCategoryApi,
    updateApi: updateCategoryApi,
    deleteApi: deleteCategoryApi,
    hasParent: true,
  },
}

const slugify = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

const ReferenceCrudPage = ({ entityKey }) => {
  const config = ENTITY_MAP[entityKey]
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [form, setForm] = useState({ id: null, name: '', slug: '', parentId: '' })

  const parentOptions = useMemo(() => {
    if (!config?.hasParent) return []
    return items.filter((i) => i?.parentId === null)
  }, [items, config])

  const fetchList = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const res = await config.listApi()
      setItems(Array.isArray(res) ? res : [])
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || 'Không tải được dữ liệu.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityKey])

  const handleChange = (key) => (e) => {
    const value = e.target.value
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'name' ? { slug: prev.id ? prev.slug : slugify(value) } : {}),
    }))
  }

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      name: item.name || '',
      slug: item.slug || '',
      parentId: item.parentId ?? '',
    })
  }

  const handleResetForm = () => {
    setForm({ id: null, name: '', slug: '', parentId: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        ...(config.hasParent ? { parentId: form.parentId === '' ? null : Number(form.parentId) } : {}),
      }

      if (form.id) await config.updateApi(form.id, payload)
      else await config.createApi(payload)

      await fetchList()
      handleResetForm()
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || 'Thao tác thất bại.')
    }
  }

  const handleDelete = async (id) => {
    setErrorMessage('')
    try {
      await config.deleteApi(id)
      await fetchList()
      if (form.id === id) handleResetForm()
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || 'Xóa thất bại.')
    }
  }

  if (!config) {
    return (
      <div className="p-6 bg-white border border-black/5 rounded-2xl">
        Entity không hợp lệ.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
      <div className="p-6 bg-white border border-black/5 rounded-2xl">
        <h2 className="text-lg font-semibold text-black">
          {form.id ? `Cập nhật ${config.title}` : `Tạo ${config.title}`}
        </h2>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <input
              value={form.name}
              onChange={handleChange('name')}
              className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
              placeholder="Nhập name..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Slug</label>
            <input
              value={form.slug}
              onChange={handleChange('slug')}
              className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
              placeholder="Nhập slug..."
            />
          </div>

          {config.hasParent ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Parent category</label>
              <select
                value={form.parentId}
                onChange={handleChange('parentId')}
                className="w-full px-4 py-2.5 text-sm bg-white border border-black/10 rounded-lg outline-none focus:border-black/30 cursor-pointer"
              >
                <option value="">None</option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-black/90 transition-colors"
            >
              {form.id ? 'Cập nhật' : 'Tạo mới'}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-black bg-white border border-black/10 rounded-full cursor-pointer hover:bg-black/5 transition-colors"
              onClick={handleResetForm}
            >
              Reset
            </button>
          </div>
        </form>

        {errorMessage ? (
          <div className="mt-4 px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {errorMessage}
          </div>
        ) : null}
      </div>

      <div className="p-6 bg-white border border-black/5 rounded-2xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-black">{config.title}</h2>
          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-black bg-white border border-black/10 rounded-full cursor-pointer hover:bg-black/5 transition-colors"
            onClick={fetchList}
          >
            Reload
          </button>
        </div>

        {isLoading ? (
          <div className="mt-4 text-sm text-black/60">Đang tải...</div>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="text-left text-black/50">
                  <th className="py-2">ID</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Slug</th>
                  {config.hasParent ? <th className="py-2">ParentId</th> : null}
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-t border-black/5">
                    <td className="py-3 text-black/70">{i.id}</td>
                    <td className="py-3 font-semibold text-black">{i.name}</td>
                    <td className="py-3 text-black/60">{i.slug}</td>
                    {config.hasParent ? (
                      <td className="py-3 text-black/60">{String(i.parentId ?? '')}</td>
                    ) : null}
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 text-xs font-semibold text-black bg-black/5 rounded-full cursor-pointer hover:bg-black/10 transition-colors"
                          onClick={() => handleEdit(i)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-black/90 transition-colors"
                          onClick={() => handleDelete(i.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReferenceCrudPage

