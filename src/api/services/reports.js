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

export const getList = async ({ page = 1, status, kategori, urgensi } = {}) =>
  unwrapList(
    await http.get('/reports', {
      params: {
        page,
        ...(status ? { status } : {}),
        ...(kategori ? { kategori } : {}),
        ...(urgensi ? { urgensi } : {}),
      },
    }),
  )

export const getDetail = async (kode) =>
  adaptReport(unwrap(await http.get(`/reports/${kode}`)))

export const updateIdentity = async (kode, tampilkanIdentitas) =>
  adaptReport(
    unwrap(
      await http.patch(`/reports/${kode}/identity`, {
        tampilkan_identitas: tampilkanIdentitas,
      }),
    ),
  )

export const updateStatus = async (kode, status) =>
  adaptReport(unwrap(await http.patch(`/reports/${kode}/status`, { status })))

export const escalate = async (kode, { tujuan, catatan }) =>
  adaptReport(
    unwrap(
      await http.post(`/reports/${kode}/escalate`, {
        tujuan,
        catatan: catatan ?? null,
      }),
    ),
  )
