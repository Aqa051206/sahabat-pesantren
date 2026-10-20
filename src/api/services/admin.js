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

// Catatan: tidak ada endpoint preview terpisah di kontrak beku. Mode asli
// memakai endpoint import yang sama dengan penanda `preview=1`.
// Lihat API_ASSUMPTIONS.md.
export const previewImport = async (file) => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await http.post('/admin/santri/import', form, {
    params: { preview: 1 },
  })
  if (!Array.isArray(data.data?.rows)) {
    throw new Error('Respons pratinjau impor dari server tidak valid.')
  }
  return {
    rows: data.data.rows.map((row) => {
      if (
        typeof row.valid !== 'boolean' ||
        !Array.isArray(row.errors) ||
        !['new', 'update', 'unchanged'].includes(row.action)
      ) {
        throw new Error('Respons pratinjau impor dari server tidak valid.')
      }
      return {
        index: row.index,
        idSantri: row.id_santri ?? row.idSantri ?? '',
        nisn: row.nisn ?? '',
        name: row.nama ?? row.name ?? '',
        action: row.action,
        valid: row.valid,
        errors: row.errors,
      }
    }),
  }
}

export const importSantri = async ({ file, acknowledged }) => {
  const form = new FormData()
  form.append('file', file)
  form.append('acknowledged', acknowledged ? '1' : '0')
  const result = unwrap(await http.post('/admin/santri/import', form))
  const accounts = result?.accounts
  if (!result || !Array.isArray(accounts)) {
    throw new Error('Respons hasil impor dari server tidak valid.')
  }
  const created = Number(result.created ?? result.imported ?? 0)
  const updated = Number(result.updated ?? 0)
  const unchanged = Number(result.unchanged ?? 0)
  if (
    ![created, updated, unchanged].every(
      (count) => Number.isSafeInteger(count) && count >= 0,
    ) ||
    accounts.length !== created
  ) {
    throw new Error('Respons hasil impor dari server tidak valid.')
  }
  return {
    created,
    updated,
    unchanged,
    accounts: accounts.map((account) => {
      const normalized = {
        name: account.name,
        username: account.username ?? account.nisn,
        temporaryPassword:
          account.temporary_password ?? account.temporaryPassword,
      }
      if (
        typeof normalized.name !== 'string' ||
        typeof normalized.username !== 'string' ||
        typeof normalized.temporaryPassword !== 'string'
      ) {
        throw new Error('Respons kredensial akun baru dari server tidak valid.')
      }
      return normalized
    }),
  }
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
  return {
    items: (data.data ?? []).map(adaptAccount),
    meta: adaptPagination(data.meta),
  }
}

export const createAccount = async (payload) =>
  adaptAccount(unwrap(await http.post('/admin/accounts', payload)))

export const setAccountActive = async (id, active) =>
  adaptAccount(unwrap(await http.patch(`/admin/accounts/${id}/status`, { active })))
