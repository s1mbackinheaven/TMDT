import axiosClient from './axiosClient'

export const getMyNotificationsApi = async () => {
  const res = await axiosClient.get('/notifications')
  return res.data
}

export const getUnreadNotificationsApi = async () => {
  const res = await axiosClient.get('/notifications/unread')
  return res.data
}

export const countUnreadNotificationsApi = async () => {
  const res = await axiosClient.get('/notifications/count-unread')
  return res.data
}

export const markNotificationAsReadApi = async (id) => {
  const res = await axiosClient.patch(`/notifications/${id}/read`)
  return res.data
}

export const markAllNotificationsAsReadApi = async () => {
  const res = await axiosClient.patch('/notifications/read-all')
  return res.data
}
