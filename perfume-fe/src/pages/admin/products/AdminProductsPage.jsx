import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { deleteProductApi, getProductsApi } from '../../../api/productsApi'

const AdminProductsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page') || 0)
  const size = Number(searchParams.get('size') || 20)
  const keyword = searchParams.get('keyword') || ''

  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const products = data?.content || []
  const totalPages = data?.totalPages ?? 0

  const handleChangeParams = (next) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') params.delete(k)
      else params.set(k, String(v))
    })
    setSearchParams(params)
  }

  useEffect(() => {
    const fetchList = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const res = await getProductsApi({
          page,
          size,
          sortBy: 'createdAt',
          sortDir: 'desc',
          keyword: keyword || undefined,
        })
        setData(res)
      } catch (err) {
        setErrorMessage(err?.response?.data?.message || 'Không tải được sản phẩm.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchList()
  }, [page, size, keyword])

  const handleDelete = async (id) => {
    setErrorMessage('')
    try {
      await deleteProductApi(id)
      // Reload list
      const res = await getProductsApi({
        page,
        size,
        sortBy: 'createdAt',
        sortDir: 'desc',
        keyword: keyword || undefined,
      })
      setData(res)
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || 'Xóa sản phẩm thất bại.')
    }
  }

  const handleGoCreate = () => navigate('/admin/products/new')
  const handleGoEdit = (id) => navigate(`/admin/products/${id}/edit`)

  return (
    <div>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-black">Products</h1>
          <p className="mt-2 text-sm text-black/60">
            Quản trị CRUD sản phẩm.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-black/90 transition-colors"
          onClick={handleGoCreate}
        >
          + Tạo sản phẩm
        </button>
      </div>

      <div className="mt-6 p-5 bg-white border border-black/5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <input
            value={keyword}
            onChange={(e) => handleChangeParams({ keyword: e.target.value, page: 0 })}
            className="w-full md:w-[360px] px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
            placeholder="Tìm theo name hoặc slug..."
          />
        </div>

        {errorMessage ? (
          <div className="mt-4 px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-4 text-sm text-black/60">Đang tải...</div>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead>
                <tr className="text-left text-black/50">
                  <th className="py-2">ID</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Brand</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Min price</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-black/5">
                    <td className="py-3 text-black/70">{p.id}</td>
                    <td className="py-3 font-semibold text-black">{p.name}</td>
                    <td className="py-3 text-black/60">{p.brandName}</td>
                    <td className="py-3 text-black/60">{p.categoryName}</td>
                    <td className="py-3 text-black/60">{p.status}</td>
                    <td className="py-3 text-black/60">
                      {p.minPrice ? new Intl.NumberFormat('vi-VN').format(p.minPrice) + ' đ' : '—'}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 text-xs font-semibold text-black bg-black/5 rounded-full cursor-pointer hover:bg-black/10 transition-colors"
                          onClick={() => handleGoEdit(p.id)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-black/90 transition-colors"
                          onClick={() => handleDelete(p.id)}
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

        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm">
            <button
              type="button"
              className="px-3 py-2 rounded-lg border border-black/10 cursor-pointer hover:bg-black/5 disabled:opacity-40"
              disabled={page <= 0}
              onClick={() => handleChangeParams({ page: Math.max(0, page - 1) })}
            >
              ‹
            </button>

            <div className="px-4 text-black/70">
              Trang <span className="font-semibold text-black">{page + 1}</span> / {totalPages}
            </div>

            <button
              type="button"
              className="px-3 py-2 rounded-lg border border-black/10 cursor-pointer hover:bg-black/5 disabled:opacity-40"
              disabled={page >= totalPages - 1}
              onClick={() => handleChangeParams({ page: Math.min(totalPages - 1, page + 1) })}
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default AdminProductsPage

