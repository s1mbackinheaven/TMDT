import axiosClient from './axiosClient'

export const getDashboardStatsApi = async () => {
  try {
    const res = await axiosClient.get('/dashboard/stats')
    return res.data
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu thống kê:', error)
    return null
  }
}
