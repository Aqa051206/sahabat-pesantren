import { http } from '../client'
import { adaptAccount, adaptPagination } from '../adapters'

const unwrap = (response) => response.data.data

const getSpreadsheet = async (endpoint, missingMessage) => {
  try {
    const { data } = await http.get(endpoint, { responseType: 'blob' })
    return data
  } catch (error) {
    if (error?.status === 404) {
      throw new Error(missingMessage, { cause: error })
    }
    throw error
  }
}

export const getTemplate = async () =>
  getSpreadsheet(
    '/admin/santri/template',
    'Template Excel belum tersedia di server. Backend perlu menyediakan endpoint GET /api/admin/santri/template.',
  )

export const getSantriExport = async () =>
  getSpreadsheet(
    '/admin/santri/export',
    'Unduh data belum tersedia karena endpoint ekspor belum dibuat di backend. Minta pengelola backend menambahkan GET /api/admin/santri/export.',
  )

export const previewImport = async (file) => {
  const form = new FormData()
  form.append('file', file)
  form.append('action', 'preview')
  const { data } = await http.post('/admin/santri/import', form)
  if (
    !Array.isArray(data.data) ||
    !Array.isArray(data.errors) ||
    !['string', 'boolean'].includes(typeof data.can_import)
  ) {
    throw new Error('Respons pratinjau impor dari server tidak valid.')
  }

  const errorsByRow = new Map(
    data.errors.map((item) => {
      const errors = Object.values(item.errors ?? {}).flatMap((messages) =>
        Array.isArray(messages) ? messages : [messages],
      )
      return [String(item.row), errors.map(String)]
    }),
  )
  const canImport =
    typeof data.can_import === 'boolean'
      ? data.can_import
      : ['1', 'true', 'yes', 'ya', 'bisa'].includes(
          data.can_import.trim().toLowerCase(),
        )

  return {
    rows: data.data.map((row) => {
      if (typeof row.valid !== 'boolean') {
        throw new Error('Respons pratinjau impor dari server tidak valid.')
      }
      const errors = errorsByRow.get(String(row.row)) ?? []
      return {
        index: row.row,
        name: String(row.name ?? ''),
        email: String(row.email ?? ''),
        nis: String(row.nis ?? ''),
        jenisKelamin: String(row.jenis_kelamin ?? ''),
        teleponOrtu: String(row.telepon_ortu ?? ''),
        action: 'new',
        valid: row.valid && errors.length === 0,
        errors,
      }
    }),
    canImport,
    message: data.message ?? '',
  }
}

export const importSantri = async ({ file }) => {
  const form = new FormData()
  form.append('file', file)
  form.append('action', 'import')
  const { data } = await http.post('/admin/santri/import', form)
  const created = Number(data.imported ?? data.data?.imported)
  if (!Number.isSafeInteger(created) || created < 0) {
    throw new Error('Respons hasil impor dari server tidak valid.')
  }
  return {
    created,
    updated: 0,
    unchanged: 0,
    message: data.message ?? '',
  }
}

// Endpoint akun (GET/POST/PATCH) DIASUMSIKAN, belum ada di kontrak beku.
export const getAccounts = async () => {
  const { data } = await http.get('/admin/accounts')
  const items = Array.isArray(data.data) ? data.data : data.accounts
  if (!Array.isArray(items)) {
    throw new Error('Respons daftar akun dari server tidak valid.')
  }
  return {
    items: items.map(adaptAccount),
    meta: adaptPagination(data.meta, items.length),
  }
}

export const createAccount = async (payload) =>
  adaptAccount(unwrap(await http.post('/admin/accounts', payload)))

export const setAccountActive = async (id, active) =>
  adaptAccount(unwrap(await http.patch(`/admin/accounts/${id}/status`, { active })))
