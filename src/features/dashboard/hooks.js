import { useQuery } from '@tanstack/react-query'
import * as api from '../../api'
import { reportKeys } from '../reports/queryKeys'

const retryUnlessClientError = (count, error) =>
  error?.status >= 500 && count < 1

export const useSummary = () =>
  useQuery({
    queryKey: reportKeys.summary(),
    queryFn: () => api.dashboard.getSummary(),
    retry: retryUnlessClientError,
  })
