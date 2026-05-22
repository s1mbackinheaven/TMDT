import axiosClient from './axiosClient'

export const getCartApi = async () => {
  const res = await axiosClient.get('/cart')
  return res.data
}

export const addCartItemApi = async ({ productId, variantId, quantity }) => {
  const res = await axiosClient.post('/cart/items', { productId, variantId, quantity })
  return res.data
}

export const updateCartItemApi = async (cartItemId, payload) => {
  const res = await axiosClient.patch(`/cart/items/${cartItemId}`, payload)
  return res.data
}

export const deleteCartItemApi = async (cartItemId) => {
  const res = await axiosClient.delete(`/cart/items/${cartItemId}`)
  return res.data
}

export const clearCartApi = async () => {
  const res = await axiosClient.delete('/cart/clear')
  return res.data
}

export const mergeCartApi = async (payload) => {
  const res = await axiosClient.post('/cart/merge', payload)
  return res.data
}
