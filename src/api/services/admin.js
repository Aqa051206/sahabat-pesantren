import { http } from '../client'
import { adaptAccount, adaptPagination } from '../adapters'

const unwrap = (response) => response.data.data

export const getTemplate = async () =>
  unwrap(await http.get('/admin/santri/template'))

// Catatan: tidak ada endpoint preview terpisah di kontrak beku. Mode asli
// memakai endpoint import yang sama dengan penanda `preview=1`.
// Lihat API_ASSUMPTIONS.md.
export const previewImport = async (file) => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await http.post('/admin/santri/import', form, {
    params: { preview: 1 },
  })
  return data.data
}

export const importSantri = async ({ file, acknowledged }) => {
  const form = new FormData()
  form.append('file', file)
  form.append('acknowledged', acknowledged ? '1' : '0')
  return unwrap(await http.post('/admin/santri/import', form))
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
