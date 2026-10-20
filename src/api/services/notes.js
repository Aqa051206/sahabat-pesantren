import { http } from '../client'
import { adaptNote } from '../adapters'

export const addNote = async (id, { body, authorName }) => {
  const { data } = await http.post(`/reports/${id}/notes`, { catatan: body })
  return {
    ...adaptNote(data.data),
    authorName:
      data.data?.user?.name ?? data.data?.author_name ?? authorName ?? null,
  }
}
