import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const AdminGuard = () => {
  const { isAuthenticated, user } = useAuth()
  const role = user?.role

  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (role !== 'ADMIN') return <Navigate to="/" replace />

  return <Outlet />
}

export default AdminGuard

