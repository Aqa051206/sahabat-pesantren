import { http } from '../client'
import { adaptMessage } from '../adapters'

const unwrap = (response) => response.data.data

export const getMessages = async (kode) => {
  const { data } = await http.get(`/reports/${kode}/messages`)
  return (data.data ?? []).map(adaptMessage)
}

export const sendMessage = async (kode, body) =>
  adaptMessage(unwrap(await http.post(`/reports/${kode}/messages`, { body })))
