import { http } from '../client'
import { adaptNotificationSummary } from '../adapters'

export const getSummary = async () => {
  const { data } = await http.get('/notifications/summary')
  return adaptNotificationSummary(data.data)
}
