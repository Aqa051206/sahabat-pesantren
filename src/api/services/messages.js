import { http } from '../client'
import { adaptMessage } from '../adapters'

const unwrap = (response) => response.data.data

export const getMessages = async (id) => {
  const { data } = await http.get(`/reports/${id}/messages`)
  return (data.data ?? []).map(adaptMessage)
}

export const sendMessage = async (id, body) =>
  adaptMessage(unwrap(await http.post(`/reports/${id}/messages`, { body })))
