import { Navigate } from 'react-router-dom'
import { homeForRole, ROLES } from '../../lib/constants'
import { useAuth } from './auth-context'

export function RedirectIfAuthenticated({ children }) {
  const { user, isAuthenticated } = useAuth()

  if (isAuthenticated && user) {
    if (user.mustChangePassword && user.role !== ROLES.SANTRI) {
      return <Navigate to="/ganti-password" replace />
    }
    return <Navigate to={homeForRole(user.role)} replace />
  }

  return children
}
