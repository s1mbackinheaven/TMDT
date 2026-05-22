import axiosClient from './axiosClient'

export const getBrandsApi = async () => {
  const res = await axiosClient.get('/brands')
  return res.data
}

export const getCategoriesApi = async () => {
  const res = await axiosClient.get('/categories')
  return res.data
}

export const getCollectionsApi = async () => {
  const res = await axiosClient.get('/collections')
  return res.data
}

export const getScentFamiliesApi = async () => {
  const res = await axiosClient.get('/scent-families')
  return res.data
}

export const getTagsApi = async () => {
  const res = await axiosClient.get('/tags')
  return res.data
}

