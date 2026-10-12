import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth-context'

export function RequireAuth({ roles, children }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.mustChangePassword && location.pathname !== '/ganti-password') {
    return <Navigate to="/ganti-password" replace />
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return children
}
