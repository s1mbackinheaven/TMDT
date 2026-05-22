import axiosClient from './axiosClient'

// CRUD cho reference data (đang có sẵn ở ReferenceDataController)

export const createBrandApi = async ({ name, slug }) => {
  const res = await axiosClient.post('/brands', { name, slug })
  return res.data
}

export const updateBrandApi = async (id, { name, slug }) => {
  const res = await axiosClient.put(`/brands/${id}`, { name, slug })
  return res.data
}

export const deleteBrandApi = async (id) => {
  const res = await axiosClient.delete(`/brands/${id}`)
  return res.data
}

export const createTagApi = async ({ name, slug }) => {
  const res = await axiosClient.post('/tags', { name, slug })
  return res.data
}

export const updateTagApi = async (id, { name, slug }) => {
  const res = await axiosClient.put(`/tags/${id}`, { name, slug })
  return res.data
}

export const deleteTagApi = async (id) => {
  const res = await axiosClient.delete(`/tags/${id}`)
  return res.data
}

export const createCollectionApi = async ({ name, slug }) => {
  const res = await axiosClient.post('/collections', { name, slug })
  return res.data
}

export const updateCollectionApi = async (id, { name, slug }) => {
  const res = await axiosClient.put(`/collections/${id}`, { name, slug })
  return res.data
}

export const deleteCollectionApi = async (id) => {
  const res = await axiosClient.delete(`/collections/${id}`)
  return res.data
}

export const createScentFamilyApi = async ({ name, slug }) => {
  const res = await axiosClient.post('/scent-families', { name, slug })
  return res.data
}

export const updateScentFamilyApi = async (id, { name, slug }) => {
  const res = await axiosClient.put(`/scent-families/${id}`, { name, slug })
  return res.data
}

export const deleteScentFamilyApi = async (id) => {
  const res = await axiosClient.delete(`/scent-families/${id}`)
  return res.data
}

export const createCategoryApi = async ({ name, slug, parentId }) => {
  const res = await axiosClient.post('/categories', { name, slug, parentId })
  return res.data
}

export const updateCategoryApi = async (id, { name, slug, parentId }) => {
  const res = await axiosClient.put(`/categories/${id}`, { name, slug, parentId })
  return res.data
}

export const deleteCategoryApi = async (id) => {
  const res = await axiosClient.delete(`/categories/${id}`)
  return res.data
}

