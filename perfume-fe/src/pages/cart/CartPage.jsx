import { useEffect, useMemo, useState } from 'react'
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { deleteCartItemApi, getCartApi, updateCartItemApi } from '../../api/cartApi'
import { useToast } from '../../contexts/ToastContext'

const formatVnd = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' đ'

const getSelectedVariantId = (item) => {
  const variantOptions = Array.isArray(item?.variantOptions) ? item.variantOptions : []
  const selectedOption = variantOptions.find((v) => v.selected)
  return Number(item?.variantId || selectedOption?.variantId || 0)
}

const getSelectedStock = (item) => {
  const variantOptions = Array.isArray(item?.variantOptions) ? item.variantOptions : []
  const selectedOption = variantOptions.find((v) => v.selected)
  return Number(selectedOption?.stockQuantity ?? item?.availableStock ?? 0)
}

const getSelectedVariantLabel = (item) => {
  const variantOptions = Array.isArray(item?.variantOptions) ? item.variantOptions : []
  const selectedOption = variantOptions.find((v) => v.selected)
  return selectedOption?.volume || item?.variantVolume || ''
}

const getVariantLabel = (item, variantId) => {
  const variantOptions = Array.isArray(item?.variantOptions) ? item.variantOptions : []
  return variantOptions.find((v) => Number(v.variantId) === Number(variantId))?.volume || ''
}

const getVariantStock = (item, variantId) => {
  const variantOptions = Array.isArray(item?.variantOptions) ? item.variantOptions : []
  return Number(variantOptions.find((v) => Number(v.variantId) === Number(variantId))?.stockQuantity ?? getSelectedStock(item))
}

const CartPage = () => {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const [cart, setCart] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [draftQuantities, setDraftQuantities] = useState({})
  const [draftVariants, setDraftVariants] = useState({})

  const items = Array.isArray(cart?.items) ? cart.items : []

  const syncDraftState = (cartResponse) => {
    const currentItems = Array.isArray(cartResponse?.items) ? cartResponse.items : []
    setDraftQuantities(Object.fromEntries(currentItems.map((item) => [item.id, Number(item.quantity || 1)])))
    setDraftVariants(Object.fromEntries(currentItems.map((item) => [item.id, String(item.variantId || getSelectedVariantId(item) || '')])))
    setSelectedIds(currentItems.map((i) => i.id))
  }

  const refreshCart = async () => {
    const res = await getCartApi()
    setCart(res)
    syncDraftState(res)
    return res
  }

  useEffect(() => {
    const run = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        await refreshCart()
      } catch (err) {
        setErrorMessage(err?.response?.data?.message || 'Không tải được giỏ hàng.')
      } finally {
        setIsLoading(false)
      }
    }
    run()
  }, [])

  const selectedItems = useMemo(() => items.filter((item) => selectedIds.includes(item.id)), [items, selectedIds])

  const subtotal = useMemo(() => selectedItems.reduce((sum, item) => sum + Number(item.lineSubtotal || 0), 0), [selectedItems])

  const handleToggleItem = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleChangeQuantity = async (item, nextQuantity) => {
    const rawQuantity = String(nextQuantity ?? '')
    if (rawQuantity === '') {
      setDraftQuantities((prev) => ({ ...prev, [item.id]: '' }))
      return
    }
    if (!/^\d+$/.test(rawQuantity)) return
    const quantityValue = Number(rawQuantity)
    if (quantityValue < 1) return
    const maxStock = getSelectedStock(item)
    if (maxStock && quantityValue > maxStock) {
      const message = `Số lượng tối đa cho dung tích này là ${maxStock}.`
      setErrorMessage('')
      pushToast(message, 'error')
      setDraftQuantities((prev) => ({ ...prev, [item.id]: String(item.quantity || 1) }))
      return
    }
    setErrorMessage('')
    const variantId = Number(draftVariants[item.id] || item.variantId || getSelectedVariantId(item))
    setDraftQuantities((prev) => ({ ...prev, [item.id]: quantityValue }))
    try {
      await updateCartItemApi(item.id, {
        quantity: quantityValue,
        variantId,
      })
      await refreshCart()
    } catch (err) {
      setDraftQuantities((prev) => ({ ...prev, [item.id]: Number(item.quantity || 1) }))
      setErrorMessage(err?.response?.data?.message || 'Không cập nhật được số lượng.')
    }
  }

  const handleQuantityBlur = (item) => {
    const currentQuantity = draftQuantities[item.id]
    if (currentQuantity === undefined || currentQuantity === null || currentQuantity === '') {
      setDraftQuantities((prev) => ({ ...prev, [item.id]: '' }))
      return
    }
    const nextQuantity = Number(currentQuantity)
    if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
      setDraftQuantities((prev) => ({ ...prev, [item.id]: Number(item.quantity || 1) }))
      return
    }
    if (nextQuantity === Number(item.quantity || 1)) return
    handleChangeQuantity(item, nextQuantity)
  }

  const handleQuantityKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur()
    }
  }

  const handleChangeVariant = async (item, variantId) => {
    if (!variantId) return
    setErrorMessage('')
    const quantity = Number(draftQuantities[item.id] || item.quantity || 1)
    const selectedStock = getVariantStock(item, variantId)
    if (selectedStock && quantity > selectedStock) {
      const message = `Số lượng tối đa cho ${getVariantLabel(item, variantId) || 'dung tích này'} là ${selectedStock}.`
      setErrorMessage(message)
      pushToast(message, 'error')
      setDraftQuantities((prev) => ({ ...prev, [item.id]: selectedStock }))
      return
    }
    setDraftVariants((prev) => ({ ...prev, [item.id]: String(variantId) }))
    try {
      await updateCartItemApi(item.id, {
        quantity,
        variantId: Number(variantId),
      })
      await refreshCart()
    } catch (err) {
      setDraftVariants((prev) => ({ ...prev, [item.id]: String(item.variantId || getSelectedVariantId(item) || '') }))
      setErrorMessage(err?.response?.data?.message || 'Không đổi được dung tích.')
    }
  }

  const handleDelete = async (itemId) => {
    setErrorMessage('')
    try {
      await deleteCartItemApi(itemId)
      await refreshCart()
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || 'Không xóa được sản phẩm.')
    }
  }

  return (
    <div className="w-full max-w-[1200px] px-4 md:px-10 lg:px-16 mx-auto py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-black">Giỏ hàng</h1>
          <p className="mt-2 text-sm text-black/60">Chọn sản phẩm muốn mua, chỉnh số lượng và sang bước thanh toán.</p>
        </div>
        <button type="button" onClick={() => navigate('/products')} className="px-5 py-2.5 text-sm font-semibold text-black bg-white border border-black/10 rounded-full hover:bg-black/5 transition-colors">Tiếp tục mua sắm</button>
      </div>

      {errorMessage ? <div className="mt-5 px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">{errorMessage}</div> : null}

      {isLoading ? (
        <div className="mt-6 text-sm text-black/60">Đang tải giỏ hàng...</div>
      ) : items.length ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-4">
            {items.map((item) => {
              const checked = selectedIds.includes(item.id)
              const currentVariantId = draftVariants[item.id] ?? String(getSelectedVariantId(item) || '')
              const currentQuantity = draftQuantities[item.id] ?? Number(item.quantity || 1)
              const variantOptions = Array.isArray(item.variantOptions) ? item.variantOptions : []
              const currentStock = getSelectedStock(item)
              const currentVariantLabel = getSelectedVariantLabel(item)
              return (
                <div key={item.id} className="p-5 bg-white border border-black/5 rounded-2xl flex gap-4">
                  <input type="checkbox" checked={checked} onChange={() => handleToggleItem(item.id)} className="mt-2 w-4 h-4 accent-black" />
                  <Link to={`/products/${item.productId}`} className="w-20 h-20 rounded-xl bg-black/5 overflow-hidden shrink-0 block">
                    <img src={item.thumbnail || ''} alt={item.productName || 'product'} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link to={`/products/${item.productId}`} className="font-semibold text-black hover:underline break-words">
                          {item.productName || 'Sản phẩm'}
                        </Link>
                        <p className="mt-1 text-sm text-black/60">{currentVariantLabel || ''}</p>
                        {currentStock ? (
                          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-black/70 bg-black/5 border border-black/10 rounded-full whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Còn {currentStock} sản phẩm
                          </div>
                        ) : null}
                      </div>
                      <button type="button" onClick={() => handleDelete(item.id)} className="text-black/40 hover:text-red-600 transition-colors shrink-0"><FiTrash2 /></button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                      <div className="min-w-0">
                        <select
                          value={currentVariantId}
                          onChange={(e) => handleChangeVariant(item, e.target.value)}
                          className="px-3 py-2 text-sm bg-white border border-black/10 rounded-lg outline-none cursor-pointer"
                        >
                          {variantOptions.map((v) => (
                            <option key={v.variantId} value={v.variantId} disabled={v.selected}>
                              {v.volume}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="inline-flex items-center gap-2 px-2 py-1.5 bg-black/5 rounded-full shrink-0">
                        <button
                          type="button"
                          disabled={Number(currentQuantity) <= 1}
                          onClick={() => handleChangeQuantity(item, Number(currentQuantity) - 1)}
                          className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FiMinus size={14} />
                        </button>
                        <input
                          value={currentQuantity === 0 ? '' : currentQuantity}
                          onChange={(e) => {
                            const value = e.target.value
                            if (!/^\d*$/.test(value)) return
                            setDraftQuantities((prev) => ({ ...prev, [item.id]: value }))
                          }}
                          onBlur={() => handleQuantityBlur(item)}
                          onKeyDown={handleQuantityKeyDown}
                          inputMode="numeric"
                          className="w-14 text-center text-sm font-semibold bg-transparent outline-none"
                        />
                        <button
                          type="button"
                          disabled={currentStock ? Number(currentQuantity) >= currentStock : false}
                          onClick={() => handleChangeQuantity(item, Number(currentQuantity) + 1)}
                          className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                      <div className="text-right shrink-0 whitespace-nowrap">
                        <p className="text-xs text-black/45">Tạm tính</p>
                        <p className="text-lg font-semibold text-black">{formatVnd(item.lineSubtotal)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <aside className="p-5 bg-white border border-black/5 rounded-2xl h-fit sticky top-28">
            <h2 className="text-lg font-semibold text-black">Tổng đơn</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-black/60">Sản phẩm đã chọn</span><span className="font-semibold">{selectedItems.length}</span></div>
              <div className="flex items-center justify-between"><span className="text-black/60">Tạm tính</span><span className="font-semibold">{formatVnd(subtotal)}</span></div>
              <div className="flex items-center justify-between"><span className="text-black/60">Tổng đơn</span><span className="font-semibold">{formatVnd(cart?.grandTotal)}</span></div>
            </div>
            <button type="button" onClick={() => navigate('/checkout', { state: { selectedIds, cart } })} disabled={!selectedItems.length} className="mt-5 w-full px-5 py-3 text-sm font-semibold text-white bg-black rounded-full disabled:opacity-40 hover:bg-black/90 transition-colors">Thanh toán</button>
          </aside>
        </div>
      ) : (
        <div className="mt-8 p-10 bg-white border border-black/5 rounded-2xl text-center">
          <FiShoppingBag className="mx-auto text-black/30" size={44} />
          <p className="mt-4 text-lg font-semibold text-black">Giỏ hàng của bạn đang trống</p>
        </div>
      )}
    </div>
  )
}

export default CartPage
