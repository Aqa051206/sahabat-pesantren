import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import * as api from '../../api'
import { reportKeys } from './queryKeys'

// Jangan mengulang permintaan untuk error yang tidak akan berubah.
const retryUnlessClientError = (count, error) =>
  error?.status >= 500 && count < 1

export const useMyReports = (page) =>
  useQuery({
    queryKey: reportKeys.mine(page),
    queryFn: () => api.reports.getMine({ page }),
    retry: retryUnlessClientError,
    placeholderData: (previous) => previous,
  })

export const useReport = (kode) =>
  useQuery({
    queryKey: reportKeys.detail(kode),
    queryFn: () => api.reports.getDetail(kode),
    enabled: Boolean(kode),
    retry: retryUnlessClientError,
  })

export const useStaffReports = (filters) =>
  useQuery({
    queryKey: reportKeys.staff(filters),
    queryFn: () => api.reports.getList(filters),
    retry: retryUnlessClientError,
    placeholderData: (previous) => previous,
  })

export const useCreateReport = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.reports.createReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'mine'] })
    },
  })
}

export const useUpdateIdentity = (kode) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tampilkanIdentitas) =>
      api.reports.updateIdentity(kode, tampilkanIdentitas),
    onSuccess: (report) => {
      queryClient.setQueryData(reportKeys.detail(kode), report)
      queryClient.invalidateQueries({ queryKey: ['reports', 'mine'] })
    },
  })
}

export const useUpdateStatus = (kode) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status) => api.reports.updateStatus(kode, status),
    onSuccess: (report) => {
      queryClient.setQueryData(reportKeys.detail(kode), report)
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export const useEscalate = (kode) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.reports.escalate(kode, payload),
    onSuccess: (report) => {
      queryClient.setQueryData(reportKeys.detail(kode), report)
    },
  })
}

export const useAddNote = (kode) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.notes.addNote(kode, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(kode) })
    },
  })
}
