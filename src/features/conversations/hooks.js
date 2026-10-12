import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../../api'
import { reportKeys } from '../reports/queryKeys'

export const useMessages = (kode) =>
  useQuery({
    queryKey: reportKeys.conversation(kode),
    queryFn: () => api.messages.getMessages(kode),
    enabled: Boolean(kode),
    refetchInterval: 10000,
  })

export const useSendMessage = (kode) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.messages.sendMessage(kode, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.conversation(kode) })
    },
  })
}
