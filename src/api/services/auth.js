import { http } from '../client'
import { adaptUser } from '../adapters'

export const login = async ({ identifier, password }) => {
  const { data } = await http.post(
    '/auth/login',
    { identifier, password },
    { skipSessionExpiry: true },
  )
  return {
    token: data.data.token,
    user: adaptUser(data.data.user),
  }
}

export const changePassword = async ({ currentPassword, newPassword }) => {
  await http.post('/auth/password', {
    current_password: currentPassword,
    new_password: newPassword,
  })
}

export const logout = async (token) => {
  await http.post(
    '/logout',
    {},
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: 5000,
      skipSessionExpiry: true,
    },
  )
}
