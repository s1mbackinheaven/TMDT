import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FiBookOpen, FiBox, FiBell, FiGrid, FiHome, FiShoppingBag, FiUsers, FiTag } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'

const linkBase =
  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer'

const AdminLayout = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()



  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-black">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="sticky top-0 h-screen hidden lg:flex flex-col border-r border-black/10 bg-white">
          <div className="px-6 py-5 border-b border-black/10">
            <div className="flex items-center gap-3">

              <div>
                <p className="text-sm font-semibold">Quản trị viên</p>
                <p className="text-xs text-black/50">{user?.email || '—'}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-black text-white' : 'text-black/70 hover:bg-black/5'}`
              }
            >
              <FiHome size={16} />
              Tổng quan
            </NavLink>

            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-black text-white' : 'text-black/70 hover:bg-black/5'}`
              }
            >
              <FiBox size={16} />
              Sản phẩm
            </NavLink>

            <NavLink
              to="/admin/campaigns"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-black text-white' : 'text-black/70 hover:bg-black/5'}`
              }
            >
              <FiTag size={16} />
              Khuyến mãi
            </NavLink>

            <NavLink
              to="/admin/reference"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-black text-white' : 'text-black/70 hover:bg-black/5'}`
              }
            >
              <FiGrid size={16} />
              Dữ liệu nước hoa
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-black text-white' : 'text-black/70 hover:bg-black/5'}`
              }
            >
              <FiUsers size={16} />
              Người dùng
            </NavLink>

            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-black text-white' : 'text-black/70 hover:bg-black/5'}`
              }
            >
              <FiShoppingBag size={16} />
              Đơn hàng
            </NavLink>

            <NavLink
              to="/admin/articles"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-black text-white' : 'text-black/70 hover:bg-black/5'}`
              }
            >
              <FiBookOpen size={16} />
              Bài viết
            </NavLink>

            <NavLink
              to="/admin/notifications"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-black text-white' : 'text-black/70 hover:bg-black/5'}`
              }
            >
              <FiBell size={16} />
              Thông báo
            </NavLink>
          </nav>

          <div className="px-4 py-4 border-t border-black/10 space-y-2">

            <button
              type="button"
              className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-black rounded-xl cursor-pointer hover:bg-black/90 transition-colors"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0">
          {/* Topbar (mobile + header) */}
          <div className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-black/10">
            <div className="flex items-center justify-between gap-4 px-4 md:px-10 py-4">
              <div className="flex items-center gap-3">
                <div className="lg:hidden text-sm font-semibold">Quản trị viên</div>
                <div className="hidden md:block text-sm text-black/60">
                  Vai trò: <span className="font-semibold text-black">{user?.role || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-black/90 transition-colors"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 md:px-10 py-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout

