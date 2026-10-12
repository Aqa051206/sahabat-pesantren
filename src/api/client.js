import axios from 'axios'
import { API_URL } from '../lib/env'
import { toApiError } from './errors'
import { clearSession, emitSessionExpired, getToken } from '../lib/session'

const baseURL = `${API_URL}/api/v1`

export const http = axios.create({
  baseURL,
  headers: { Accept: 'application/json' },
  timeout: 20000,
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 401 &&
      !error?.config?.skipSessionExpiry
    ) {
      clearSession()
      emitSessionExpired()
    }
    return Promise.reject(toApiError(error))
  },
)
