import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../../api'
import {
  clearSession,
  getSession,
  getToken,
  onSessionExpired,
  setSession,
} from '../../lib/session'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => getSession())
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const store = useCallback((next) => {
    setSessionState(next)
    if (next) setSession(next)
    else clearSession()
  }, [])

  const login = useCallback(
    async (credentials) => {
      const result = await api.auth.login(credentials)
      store({ token: result.token, user: result.user })
      return result.user
    },
    [store],
  )

  const logout = useCallback(() => {
    const token = getToken()
    store(null)
    queryClient.clear()
    void api.auth.logout(token).catch(() => {})
  }, [store, queryClient])

  const quickExit = useCallback(() => {
    const token = getToken()
    store(null)
    queryClient.clear()
    void api.auth.logout(token).catch(() => {})
    window.location.replace('/')
  }, [store, queryClient])

  const changePassword = useCallback(
    async (payload) => {
      await api.auth.changePassword(payload)
      const current = getSession()
      if (current) {
        const next = {
          ...current,
          user: { ...current.user, mustChangePassword: false },
        }
        setSessionState(next)
        setSession(next)
      }
    },
    [],
  )

  useEffect(
    () =>
      onSessionExpired(() => {
        setSessionState(null)
        queryClient.clear()
        navigate('/login', {
          replace: true,
          state: { message: 'Sesi berakhir. Silakan masuk kembali.' },
        })
      }),
    [navigate, queryClient],
  )

  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted && !getToken()) {
        navigate('/login', { replace: true })
      }
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [navigate])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.token),
      login,
      logout,
      quickExit,
      changePassword,
    }),
    [session, login, logout, quickExit, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
