import axios from 'axios'

const axiosClient = axios.create({
  // baseURL: 'http://localhost:8080/api/v1',
  baseURL: 'https://api.culus.io.vn/api/v1',
  timeout: 20000,
})

axiosClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')
  const guestKey = localStorage.getItem('guestKey')

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  if (guestKey) {
    config.headers['X-Guest-Key'] = guestKey
  }
  return config
})

export default axiosClient