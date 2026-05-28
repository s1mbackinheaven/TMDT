import axiosClient from './axiosClient'

export const getPublicArticlesApi = async (params = {}) => {
  const res = await axiosClient.get('/articles', { params })
  return res.data
}

export const getPublicArticleBySlugApi = async (slug) => {
  const res = await axiosClient.get(`/articles/${slug}`)
  return res.data
}

export const getAdminArticlesApi = async () => {
  const res = await axiosClient.get('/admin/articles')
  return res.data
}

export const getAdminArticleDetailApi = async (id) => {
  const res = await axiosClient.get(`/admin/articles/${id}`)
  return res.data
}

export const createAdminArticleMultipartApi = async (formData) => {
  const res = await axiosClient.post('/admin/articles/multipart', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const deleteAdminArticleApi = async (id) => {
  const res = await axiosClient.delete(`/admin/articles/${id}`)
  return res.data
}
