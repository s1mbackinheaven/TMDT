import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const AdminGuard = () => {
  const { isAuthenticated, user } = useAuth()
  const role = user?.role

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  if (role !== 'ADMIN') return <Navigate to="/admin/login" replace />

  return <Outlet />
}

export default AdminGuard

