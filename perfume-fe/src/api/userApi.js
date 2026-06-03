import axiosClient from './axiosClient'

export const getMyUserApi = async () => {
  const res = await axiosClient.get('/users/me')
  return res.data
}

export const getAllUsersApi = async () => {
  const res = await axiosClient.get('/users')
  return res.data
}

export const getUserByIdApi = async (userId) => {
  const res = await axiosClient.get(`/users/${userId}`)
  return res.data
}

export const toggleUserStatusApi = async (userId) => {
  const res = await axiosClient.patch(`/users/${userId}/toggle-status`)
  return res.data
}
