import { http } from '../client'
import { adaptAccount, adaptPagination } from '../adapters'

const unwrap = (response) => response.data.data

const downloadPayload = (response, fallbackFilename) => {
  const disposition = response.headers?.['content-disposition'] ?? ''
  const encodedFilename = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const plainFilename = disposition.match(/filename="?([^";]+)"?/i)?.[1]
  return {
    blob: response.data,
    filename: decodeURIComponent(encodedFilename ?? plainFilename ?? fallbackFilename),
  }
}

export const getTemplate = async () =>
  downloadPayload(
    await http.get('/admin/santri/template', { responseType: 'blob' }),
    'template-import-santri.xlsx',
  )

export const exportSantri = async () =>
  downloadPayload(
    await http.get('/admin/santri/export', { responseType: 'blob' }),
    'data-santri.xlsx',
  )

export const previewImport = async (file) => {
  const form = new FormData()
  form.append('action', 'preview')
  form.append('file', file)
  const { data } = await http.post('/admin/santri/import', form)
  const rowErrors = new Map(
    (data.errors ?? []).map((item) => [
      Number(item.row),
      Object.values(item.errors ?? {}).flat(),
    ]),
  )
  const rows = (data.data ?? []).map((row) => ({
    index: Number(row.row),
    name: row.name ?? '',
    email: row.email ?? '',
    nis: row.nis ?? '',
    jenisKelamin: row.jenis_kelamin ?? '',
    teleponOrtu: row.telepon_ortu ?? '',
    valid: Boolean(row.valid),
    errors: rowErrors.get(Number(row.row)) ?? [],
  }))

  return { rows, canImport: Boolean(data.can_import), message: data.message }
}

export const importSantri = async ({ file }) => {
  const form = new FormData()
  form.append('action', 'import')
  form.append('file', file)
  const { data } = await http.post('/admin/santri/import', form)
  return data.data ?? data
}

// Endpoint akun (GET/POST/PATCH) DIASUMSIKAN, belum ada di kontrak beku.
export const getAccounts = async ({ q, role, active } = {}) => {
  const { data } = await http.get('/admin/accounts', {
    params: {
      ...(q ? { q } : {}),
      ...(role ? { role } : {}),
      ...(active === undefined || active === '' ? {} : { active }),
    },
  })
  const body = data ?? {}
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
    items: items.map(adaptAccount),
    meta: adaptPagination(meta, items.length),
  }
}

export const createAccount = async (payload) =>
  adaptAccount(unwrap(await http.post('/admin/accounts', payload)))

export const setAccountActive = async (id, active) =>
  adaptAccount(unwrap(await http.patch(`/admin/accounts/${id}/status`, { active })))
