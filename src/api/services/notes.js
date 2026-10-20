import { http } from '../client'
import { adaptNote } from '../adapters'

export const addNote = async (id, body) => {
  const { data } = await http.post(`/reports/${id}/notes`, { catatan: body })
  return adaptNote(data.data)
}
