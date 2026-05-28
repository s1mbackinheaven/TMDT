import axiosClient from './axiosClient'

export const createAdminNotificationApi = async (payload) => {
  const res = await axiosClient.post('/admin/notifications', payload)
  return res.data
}

export const broadcastAdminNotificationApi = async (payload) => {
  const res = await axiosClient.post('/admin/notifications/broadcast', payload)
  return res.data
}
