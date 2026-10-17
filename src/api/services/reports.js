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

// Pimpinan meminta izin melihat nama pelapor. Bukti (opsional) dikirim
// sebagai berkas; jangan set Content-Type manual agar boundary terisi.
export const requestIdentity = async (id, { alasan, bukti }) => {
  const form = new FormData()
  form.append('alasan', alasan)
  if (bukti) form.append('bukti', bukti)
  return adaptReport(
    unwrap(await http.post(`/reports/${id}/identity-request`, form)),
  )
}

// Santri menjawab: status = 'disetujui' | 'ditolak' | 'dicabut'.
export const answerIdentityRequest = async (id, status) =>
  adaptReport(
    unwrap(await http.patch(`/reports/${id}/identity-request`, { status })),
  )
