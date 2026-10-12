import { http } from '../client'
import { adaptNote } from '../adapters'

export const addNote = async (kode, body) => {
  const { data } = await http.post(`/reports/${kode}/notes`, { body })
  return adaptNote(data.data)
}
