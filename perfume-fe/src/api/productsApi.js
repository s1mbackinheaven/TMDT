import axiosClient from './axiosClient'

export const getProductsApi = async ({
  page = 0,
  size = 20,
  sortBy = 'createdAt',
  sortDir = 'desc',
  brandId,
  categoryId,
  collectionId,
  scentFamilyId,
  tagIds,
  status,
  keyword,
}) => {
  const params = {
    page,
    size,
    sortBy,
    sortDir,
  }

  if (brandId) params.brandId = brandId
  if (categoryId) params.categoryId = categoryId
  if (collectionId) params.collectionId = collectionId
  if (scentFamilyId) params.scentFamilyId = scentFamilyId
  // Backend cần support dạng list. FE gửi chuỗi "1,2,3" để parse dễ (gọn, lean).
  if (Array.isArray(tagIds) && tagIds.length) params.tagId = tagIds.join(',')
  if (status) params.status = status
  if (keyword) params.keyword = keyword

  const res = await axiosClient.get('/products', { params })
  return res.data
}

export const getProductByIdApi = async (id) => {
  const res = await axiosClient.get(`/products/${id}`)
  return res.data
}

export const createProductApi = async (payload) => {
  const res = await axiosClient.post('/products', payload)
  return res.data
}

export const updateProductApi = async (id, payload) => {
  const res = await axiosClient.put(`/products/${id}`, payload)
  return res.data
}

export const deleteProductApi = async (id) => {
  const res = await axiosClient.delete(`/products/${id}`)
  return res.data
}

