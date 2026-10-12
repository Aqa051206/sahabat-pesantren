import { http } from '../client'
import { adaptUser } from '../adapters'

export const login = async ({ identifier, password }) => {
  const { data } = await http.post(
    '/auth/login',
    { identifier, password },
    { skipSessionExpiry: true },
  )
  const result = data?.data ?? data
  const token = result?.access_token ?? result?.token
  const user = adaptUser(result?.user)

  if (typeof token !== 'string' || !token || !user) {
    throw new Error('Respons login dari server tidak valid.')
  }

  return {
    token,
    user,
    message: result.message ?? data.message,
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
