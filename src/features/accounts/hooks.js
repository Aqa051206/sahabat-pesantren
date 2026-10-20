import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../../api'
import { reportKeys } from '../reports/queryKeys'

const retryUnlessClientError = (count, error) =>
  error?.status >= 500 && count < 1

export const useAccounts = () =>
  useQuery({
    queryKey: reportKeys.accounts(),
    queryFn: () => api.admin.getAccounts(),
    retry: retryUnlessClientError,
    placeholderData: (previous) => previous,
  })

export const useCreateAccount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.admin.createAccount(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] }),
  })
}

export const useSetAccountActive = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }) => api.admin.setAccountActive(id, active),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] }),
  })
}

export const useTemplate = () =>
  useQuery({
    queryKey: ['admin', 'template'],
    queryFn: () => api.admin.getTemplate(),
    retry: retryUnlessClientError,
    staleTime: Infinity,
  })

export const usePreviewImport = () =>
  useMutation({ mutationFn: (file) => api.admin.previewImport(file) })

export const useImportSantri = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.admin.importSantri(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] }),
      ])
    },
  })
}

export const useSantriExport = () =>
  useMutation({ mutationFn: () => api.admin.getSantriExport() })
