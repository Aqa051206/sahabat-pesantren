import { useQuery } from '@tanstack/react-query'
import * as api from '../../api'
import { useAuth } from '../auth/auth-context'
import { notificationKeys } from './queryKeys'

// Jangan mengulang permintaan untuk error yang tidak akan berubah.
const retryUnlessClientError = (count, error) =>
  error?.status >= 500 && count < 1

export const useNotificationSummary = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: notificationKeys.summary(),
    queryFn: () => api.notifications.getSummary(),
    enabled: Boolean(user),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 15000,
    retry: retryUnlessClientError,
  })
}

export const useNotifications = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => api.notifications.getList(),
    enabled: Boolean(user),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 15000,
    placeholderData: (previous) => previous,
    retry: retryUnlessClientError,
  })
}
