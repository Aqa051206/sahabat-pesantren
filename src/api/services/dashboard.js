import { http } from '../client'
import { adaptSummary } from '../adapters'

export const getSummary = async () => {
  const { data } = await http.get('/dashboard/summary')
  return adaptSummary(data.data)
}
