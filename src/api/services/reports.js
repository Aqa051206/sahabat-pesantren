import { http } from '../client'
import { adaptPagination, adaptReport } from '../adapters'

const unwrap = (response) => response.data.data

// Beberapa endpoint laporan membungkus model di `data`, sebagian lagi di
// `laporan`; keduanya harus dipetakan dengan adapter yang sama.
const unwrapReport = (response) =>
  response.data.data ?? response.data.laporan

// Endpoint pengajuan memakai `data` untuk model permintaan, jadi laporan
// terbaru harus diambil dari `laporan` lebih dulu.
const unwrapNestedReport = (response) =>
  response.data.laporan ?? response.data.data

const unwrapList = (response) => {
  const body = response.data ?? {}
  const payload = body.data
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(body.items)
          ? body.items
          : []
  const meta =
    payload?.meta ??
    payload?.pagination ??
    body.meta ??
    body.pagination ??
    payload ??
    body
  return {
    items: items.map(adaptReport),
    meta: adaptPagination(meta, items.length),
  }
}

export const createReport = async (payload) =>
  adaptReport(unwrapReport(await http.post('/reports', payload)))

export const getMine = async () => {
  const firstPage = unwrapList(
    await http.get('/reports/mine', { params: { page: 1 } }),
  )
  const allReports = [...firstPage.items]
  for (let page = 2; page <= firstPage.meta.lastPage; page += 1) {
    const result = unwrapList(
      await http.get('/reports/mine', { params: { page } }),
    )
    allReports.push(...result.items)
  }
  return {
    items: allReports,
    meta: adaptPagination(
      { current_page: 1, last_page: 1, total: allReports.length },
      allReports.length,
    ),
  }
}

export const getList = async ({ status, kategori, kodeLaporan } = {}) => {
  const firstPage = unwrapList(
    await http.get('/reports', { params: { page: 1 } }),
  )
  const allReports = [...firstPage.items]
  for (let page = 2; page <= firstPage.meta.lastPage; page += 1) {
    const result = unwrapList(
      await http.get('/reports', { params: { page } }),
    )
    allReports.push(...result.items)
  }

  const code = String(kodeLaporan ?? '').trim().toLowerCase()
  const filtered = allReports.filter(
    (report) =>
      (!status || report.status === status) &&
      (!kategori || report.kategori === kategori) &&
      (!code || String(report.noLaporan ?? '').toLowerCase().includes(code)),
  )
  return {
    items: filtered,
    meta: adaptPagination(
      { current_page: 1, last_page: 1, total: filtered.length },
      filtered.length,
    ),
  }
}

export const getDetail = async (id) =>
  adaptReport(unwrap(await http.get(`/reports/${id}`)))

export const updateIdentity = async (id, tampilkanIdentitas) =>
  adaptReport(
    unwrapReport(
      await http.patch(`/reports/${id}/identity`, {
        tampilkan_identitas: tampilkanIdentitas,
      }),
    ),
  )

export const updateStatus = async (id, status) =>
  adaptReport(unwrapReport(await http.patch(`/reports/${id}/status`, { status })))

export const escalate = async (id, { tujuan, catatan }) =>
  adaptReport(
    unwrapReport(
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
    unwrapNestedReport(await http.post(`/reports/${id}/identity-request`, form)),
  )
}

// Backend menerima status 1 untuk setuju dan 0 untuk menolak.
export const answerIdentityRequest = async (id, status) => {
  const answers = { disetujui: 1, ditolak: 0 }
  if (!Object.hasOwn(answers, status)) {
    throw new Error('Jawaban permintaan identitas tidak valid.')
  }
  return adaptReport(
    unwrap(
      await http.patch(`/reports/${id}/identity-request`, {
        status: answers[status],
      }),
    ),
  )
}
