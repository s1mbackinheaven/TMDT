import axiosClient from './axiosClient';

// Lấy danh sách Campaign (Admin)
export const getAdminCampaignsApi = () => {
  return axiosClient.get('/admin/campaigns').then(res => res.data);
};

// Tạo Campaign mới (Admin)
export const createCampaignApi = (data) => {
  return axiosClient.post('/admin/campaigns', data).then(res => res.data);
};

// Cập nhật Campaign (Admin)
export const updateCampaignApi = (id, data) => {
  return axiosClient.put(`/admin/campaigns/${id}`, data).then(res => res.data);
};

// Xóa Campaign (Admin)
export const deleteCampaignApi = (id) => {
  return axiosClient.delete(`/admin/campaigns/${id}`).then(res => res.data);
};

// Lấy danh sách Campaign đang hoạt động (Public)
export const getActiveCampaignsApi = () => {
  return axiosClient.get('/campaigns/active').then(res => res.data);
};
