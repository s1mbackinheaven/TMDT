import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import {
  getAdminCampaignsApi,
  createCampaignApi,
  updateCampaignApi,
  deleteCampaignApi
} from '../../../api/campaignsApi';
import { getBrandsApi } from '../../../api/filtersApi';

const AdminCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { pushToast } = useToast();
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bannerUrl: '',
    brandId: '',
    extraDiscountPercent: 0,
    isActive: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [campRes, brandRes] = await Promise.all([
        getAdminCampaignsApi(),
        getBrandsApi()
      ]);
      setCampaigns(campRes);
      // brandRes can be an object with content or just an array
      setBrands(brandRes?.content || brandRes || []);
    } catch (error) {
      pushToast('Lỗi khi tải dữ liệu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      bannerUrl: '',
      brandId: '',
      extraDiscountPercent: 0,
      isActive: false
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    setFormData({
      title: c.title,
      description: c.description || '',
      bannerUrl: c.bannerUrl || '',
      brandId: c.brandId || '',
      extraDiscountPercent: c.extraDiscountPercent || 0,
      isActive: c.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) return;
    try {
      await deleteCampaignApi(id);
      pushToast('Xóa khuyến mãi thành công', 'success');
      fetchData();
    } catch (error) {
      pushToast('Lỗi khi xóa khuyến mãi', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || formData.extraDiscountPercent === null) {
      return pushToast('Vui lòng nhập đầy đủ thông tin bắt buộc', 'error');
    }

    try {
      const payload = {
        ...formData,
        brandId: formData.brandId ? Number(formData.brandId) : null,
        extraDiscountPercent: Number(formData.extraDiscountPercent)
      };

      if (editingId) {
        await updateCampaignApi(editingId, payload);
        pushToast('Cập nhật khuyến mãi thành công', 'success');
      } else {
        await createCampaignApi(payload);
        pushToast('Thêm khuyến mãi thành công', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      pushToast(error?.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 font-[Montserrat]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Quản lý Khuyến Mãi (Campaign)</h2>
          <p className="text-sm text-gray-500 mt-1">Cài đặt các chương trình giảm giá toàn hệ thống hoặc theo Brand</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <FiPlus />
          Thêm Campaign
        </button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-gray-500">Đang tải dữ liệu...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 px-4 text-sm font-medium text-gray-500">Tiêu đề</th>
                <th className="py-4 px-4 text-sm font-medium text-gray-500">Phạm vi</th>
                <th className="py-4 px-4 text-sm font-medium text-gray-500">% Giảm</th>
                <th className="py-4 px-4 text-sm font-medium text-gray-500">Trạng thái</th>
                <th className="py-4 px-4 text-sm font-medium text-gray-500 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">Không có campaign nào</td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{c.title}</div>
                      {c.bannerUrl && <div className="text-xs text-blue-500 mt-1 flex items-center gap-1"><FiImage/> Có banner</div>}
                    </td>
                    <td className="py-4 px-4">
                      {c.brandId ? (
                        <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                          Brand: {c.brandName || c.brandId}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700">
                          Tất cả sản phẩm
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-red-600 font-bold">-{c.extraDiscountPercent}%</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {c.isActive ? 'Đang bật' : 'Đã tắt'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Sửa"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Xóa"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Cập nhật Khuyến mãi' : 'Thêm mới Khuyến mãi'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề campaign *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                  placeholder="Ví dụ: Lễ tình nhân 14/2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (hiển thị ở Popup)</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                  placeholder="Nhân ngày lễ tình nhân giảm toàn bộ giá của Chanel đi 10%..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Ảnh Banner (hiển thị ở Popup)</label>
                <input
                  type="text"
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phạm vi áp dụng</label>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({...formData, brandId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none bg-white"
                  >
                    <option value="">Tất cả sản phẩm (Toàn hệ thống)</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>Chỉ áp dụng cho: {b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">% Giảm giá cộng thêm *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.extraDiscountPercent}
                    onChange={(e) => setFormData({...formData, extraDiscountPercent: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Sẽ cộng dồn với % giảm giá hiện tại của sản phẩm.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">Kích hoạt Campaign này ngay lập tức</span>
                </label>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
              >
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCampaignsPage;
