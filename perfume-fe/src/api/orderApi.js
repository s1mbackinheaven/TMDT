import axiosClient from './axiosClient'

export const getMyOrdersApi = async (params = {}) => {
  const res = await axiosClient.get('/orders/me', { params })
  return res.data
}

export const getOrderDetailApi = async (orderId) => {
  const res = await axiosClient.get(`/orders/${orderId}`)
  return res.data
}

export const getAllOrdersApi = async (params = {}) => {
  const res = await axiosClient.get('/orders', { params })
  return res.data
}

export const updateOrderStatusApi = async (orderId, payload) => {
  const res = await axiosClient.patch(`/orders/${orderId}/status`, payload)
  return res.data
}

export const confirmReceivedOrderApi = async (orderId) => {
  const res = await axiosClient.patch(`/orders/${orderId}/received`)
  return res.data
}

export const cancelOrderApi = async (orderId, payload = {}) => {
  const res = await axiosClient.patch(`/orders/${orderId}/cancel`, payload)
  return res.data
}
