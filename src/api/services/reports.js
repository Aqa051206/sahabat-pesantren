import { http } from '../client'
import { adaptPagination, adaptReport } from '../adapters'

const unwrap = (response) => response.data.data

const unwrapList = (response) => ({
  items: (response.data.data ?? []).map(adaptReport),
  meta: adaptPagination(response.data.meta),
})

export const createReport = async (payload) =>
  adaptReport(unwrap(await http.post('/reports', payload)))

export const getMine = async ({ page = 1 } = {}) =>
  unwrapList(await http.get('/reports/mine', { params: { page } }))

export const getList = async ({ page = 1, status, kategori } = {}) =>
  unwrapList(
    await http.get('/reports', {
      params: {
        page,
        ...(status ? { status } : {}),
        ...(kategori ? { kategori } : {}),
      },
    }),
  )

export const getDetail = async (id) =>
  adaptReport(unwrap(await http.get(`/reports/${id}`)))

export const updateIdentity = async (id, tampilkanIdentitas) =>
  adaptReport(
    unwrap(
      await http.patch(`/reports/${id}/identity`, {
        tampilkan_identitas: tampilkanIdentitas,
      }),
    ),
  )

export const updateStatus = async (id, status) =>
  adaptReport(unwrap(await http.patch(`/reports/${id}/status`, { status })))

export const escalate = async (id, { tujuan, catatan }) =>
  adaptReport(
    unwrap(
      await http.post(`/reports/${id}/escalate`, {
        tujuan,
        catatan: catatan ?? null,
      }),
    ),
  )
