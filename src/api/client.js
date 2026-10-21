import axios from 'axios'
import { API_URL } from '../lib/env'
import { toApiError } from './errors'
import { clearSession, emitSessionExpired, getToken } from '../lib/session'

const baseURL = `${API_URL}/api`

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
  async (error) => {
    const body = error?.response?.data
    if (typeof Blob !== 'undefined' && body instanceof Blob) {
      const text = await body.text()
      try {
        error.response.data = text ? JSON.parse(text) : {}
      } catch {
        error.response.data = {}
      }
    }

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
