import axiosClient from './axiosClient'

export const createPayosCheckoutApi = async (payload) => {
  const res = await axiosClient.post('/checkout/payos', payload)
  return res.data
}

export const getMyOrdersApi = async () => {
  const res = await axiosClient.get('/orders/me')
  return res.data
}

export const getOrderDetailApi = async (orderId) => {
  const res = await axiosClient.get(`/orders/${orderId}`)
  return res.data
}
