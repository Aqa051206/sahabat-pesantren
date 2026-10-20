import { ApiError } from '../errors'
import {
  adaptAccount,
  adaptMessage,
  adaptNote,
  adaptPagination,
  adaptReport,
  adaptSummary,
  adaptUser,
} from '../adapters'
import {
  IDENTITY_PROOF_MAX_BYTES,
  routesToPimpinan,
} from '../../lib/constants'
import {
  createSantriWorkbook,
  readSantriWorkbook,
} from '../../lib/santriWorkbook'
import { clearSession, emitSessionExpired, getToken } from '../../lib/session'
import {
  accounts,
  nextMessageId,
  nextNoteId,
  nextReportId,
  offsetDate,
  personName,
  reports as reportStore,
} from './store'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const fail = (status, message, errors = null) => {
  throw new ApiError({ status, message, errors })
}

const expired = () => {
  clearSession()
  emitSessionExpired()
  fail(401, 'Sesi berakhir. Silakan masuk kembali.')
}

const requireUser = () => {
  const token = getToken()
  if (!token || !token.startsWith('mock.')) expired()
  const id = Number(token.slice(5))
  const account = accounts.find((item) => item.id === id)
  if (!account || !account.active) expired()
  return account
}

const requireRole = (user, roles) => {
  if (!roles.includes(user.role)) {
    fail(403, 'Kamu tidak punya akses ke halaman ini.')
  }
}

const findReport = (id) =>
  reportStore.find((item) => String(item.id) === String(id))

const canView = (user, report) => {
  if (user.role === 'santri') return report.ownerId === user.id
  if (user.role === 'pengurus') return report.penerima === 'pengurus'
  return true
}

const accessibleReport = (user, id) => {
  const report = findReport(id)
  if (!report) fail(404, 'Laporan tidak ditemukan.')
  if (!canView(user, report)) {
    fail(403, 'Kamu tidak punya akses ke laporan ini.')
  }
  return report
}

const PROOF_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

const toRawRequest = (request, viewer) => {
  // Pengurus tidak perlu tahu soal permintaan ini; hanya pelapor dan pimpinan.
  if (!request || viewer.role === 'pengurus') return null
  return {
    status: request.status,
    alasan: request.alasan,
    diminta_oleh: request.dimintaOleh,
    bukti_nama: request.bukti?.nama ?? null,
    bukti_url: request.bukti?.url ?? null,
    dibuat: request.createdAt,
    dijawab: request.answeredAt,
  }
}

// Nama terbuka bila saklar santri menyala (untuk petugas), atau bila santri
// menyetujui permintaan pimpinan (hanya untuk pimpinan).
const revealName = (report, viewer) =>
  viewer.role !== 'santri' &&
  (report.tampilkanIdentitas ||
    (viewer.role === 'pimpinan' &&
      report.permintaanIdentitas?.status === 'disetujui'))

const toRawReport = (report, viewer) => {
  const isStaff = viewer.role !== 'santri'
  return {
    id: report.id,
    users_id: report.ownerId,
    no_laporan: report.noLaporan,
    kategori: report.kategori,
    isi: report.isi,
    tampilkan_identitas: report.tampilkanIdentitas,
    status: report.status,
    penerima: report.penerima,
    batas_klarifikasi: report.batasKlarifikasi,
    dieskalasi_tujuan: report.escalated?.tujuan ?? null,
    dieskalasi_catatan: report.escalated?.catatan ?? null,
    dieskalasi_at: report.escalated?.at ?? null,
    waktu: report.createdAt,
    pelapor_nama: revealName(report, viewer) ? personName(report.ownerId) : null,
    permintaan_identitas: toRawRequest(report.permintaanIdentitas, viewer),
    perlu_klarifikasi: report.perluKlarifikasi,
    catatan_internal: isStaff
      ? report.notes.map((note) => ({
          id: note.id,
          author_name: note.authorName,
          body: note.body,
          created_at: note.createdAt,
        }))
      : undefined,
  }
}

const toRawMessage = (item) => ({
  id: item.id,
  from: item.from,
  sender_name: item.from === 'petugas' ? item.senderName : null,
  body: item.body,
  created_at: item.createdAt,
})

const PAGE_SIZE = 8

const countBy = (items, key) =>
  items.reduce((accumulator, item) => {
    const value = item[key]
    accumulator[value] = (accumulator[value] ?? 0) + 1
    return accumulator
  }, {})

export const auth = {
  async login({ identifier, password }) {
    await delay()
    const normalizedIdentifier = String(identifier).trim().toLowerCase()
    const account = accounts.find(
      (item) =>
        item.username.toLowerCase() === normalizedIdentifier ||
        String(item.nisn ?? '').toLowerCase() === normalizedIdentifier,
    )
    if (!account || account.password !== password) {
      fail(401, 'NIS/ID atau kata sandi salah.')
    }
    if (!account.active) {
      fail(403, 'Akun ini dinonaktifkan. Hubungi pimpinan.')
    }
    return {
      token: `mock.${account.id}`,
      user: adaptUser({
        id: account.id,
        name: account.name,
        role: account.role,
        must_change_password: account.mustChangePassword,
      }),
    }
  },

  async changePassword({ currentPassword, newPassword }) {
    await delay()
    const account = requireUser()
    if (account.password !== currentPassword) {
      fail(422, 'Kata sandi saat ini tidak cocok.', {
        current_password: ['Kata sandi saat ini tidak cocok.'],
      })
    }
    if (String(newPassword ?? '').length < 8) {
      fail(422, 'Kata sandi minimal 8 karakter.', {
        new_password: ['Kata sandi minimal 8 karakter.'],
      })
    }
    account.password = newPassword
    account.mustChangePassword = false
    return { ok: true }
  },

  async logout(_token) {
    void _token
    await delay(120)
    return { ok: true }
  },
}

export const reports = {
  async createReport(payload) {
    await delay()
    const user = requireUser()
    const today = offsetDate(0)

    const countToday = reportStore.filter(
      (item) => item.ownerId === user.id && item.createdAt === today,
    ).length
    if (countToday >= 3) {
      fail(429, 'Batas laporan hari ini sudah tercapai. Coba lagi besok, ya.')
    }

    const isi = String(payload.isi ?? '').trim()
    const errors = {}
    if (!payload.kategori) errors.kategori = ['Pilih salah satu kategori.']
    if (isi.length < 20) {
      errors.isi = ['Ceritakan sedikit lebih lengkap, minimal 20 karakter.']
    }
    if (Object.keys(errors).length) {
      fail(422, 'Periksa kembali isianmu.', errors)
    }

    const { id, noLaporan } = nextReportId()
    const penerima = routesToPimpinan({ kategori: payload.kategori })
      ? 'pimpinan'
      : 'pengurus'

    const report = {
      id,
      noLaporan,
      ownerId: user.id,
      kategori: payload.kategori,
      isi,
      tampilkanIdentitas: Boolean(payload.tampilkan_identitas),
      status: 'baru',
      penerima,
      batasKlarifikasi: offsetDate(1),
      perluKlarifikasi: false,
      escalated: null,
      createdAt: today,
      messages: [],
      notes: [],
    }
    reportStore.unshift(report)
    return adaptReport(toRawReport(report, user))
  },

  async getMine() {
    await delay()
    const user = requireUser()
    const mine = reportStore
      .filter((item) => item.ownerId === user.id)
      .map((item) => toRawReport(item, user))
    return {
      items: mine.map(adaptReport),
      meta: adaptPagination({
        current_page: 1,
        last_page: 1,
        total: mine.length,
        per_page: PAGE_SIZE,
      }),
    }
  },

  async getList({ status, kategori, kodeLaporan } = {}) {
    await delay()
    const user = requireUser()
    requireRole(user, ['pengurus', 'pimpinan'])
    let visible = reportStore.filter((item) => canView(user, item))
    if (status) visible = visible.filter((item) => item.status === status)
    if (kategori) visible = visible.filter((item) => item.kategori === kategori)
    if (kodeLaporan?.trim()) {
      const query = kodeLaporan.trim().toLowerCase()
      visible = visible.filter((item) =>
        String(item.noLaporan).toLowerCase().includes(query),
      )
    }
    const items = visible.map((item) => toRawReport(item, user))
    return {
      items: items.map(adaptReport),
      meta: adaptPagination({
        current_page: 1,
        last_page: Math.max(1, Math.ceil(items.length / PAGE_SIZE)),
        total: items.length,
        per_page: PAGE_SIZE,
      }),
    }
  },

  async getDetail(id) {
    await delay()
    const user = requireUser()
    return adaptReport(toRawReport(accessibleReport(user, id), user))
  },

  async updateIdentity(id, tampilkanIdentitas) {
    await delay()
    const user = requireUser()
    const report = accessibleReport(user, id)
    if (user.role !== 'santri') {
      fail(403, 'Hanya pelapor yang dapat mengubah ini.')
    }
    report.tampilkanIdentitas = Boolean(tampilkanIdentitas)
    return adaptReport(toRawReport(report, user))
  },

  async requestIdentity(id, { alasan, bukti }) {
    await delay(400)
    const user = requireUser()
    requireRole(user, ['pimpinan'])
    const report = accessibleReport(user, id)
    const current = report.permintaanIdentitas?.status
    if (current === 'menunggu') {
      fail(409, 'Permintaan untuk laporan ini masih menunggu jawaban santri.')
    }
    if (current === 'disetujui') {
      fail(409, 'Santri sudah menyetujui permintaan untuk laporan ini.')
    }
    const text = String(alasan ?? '').trim()
    const errors = {}
    if (text.length < 20) {
      errors.alasan = ['Jelaskan alasannya minimal 20 karakter.']
    } else if (text.length > 1000) {
      errors.alasan = ['Alasan terlalu panjang, maksimal 1000 karakter.']
    }
    if (bukti) {
      if (!PROOF_TYPES.includes(bukti.type)) {
        errors.bukti = ['Bukti harus berupa foto JPG/PNG atau berkas PDF.']
      } else if (bukti.size > IDENTITY_PROOF_MAX_BYTES) {
        errors.bukti = ['Ukuran bukti maksimal 5 MB.']
      }
    }
    if (Object.keys(errors).length) fail(422, 'Periksa kembali isian.', errors)
    report.permintaanIdentitas = {
      status: 'menunggu',
      alasan: text,
      dimintaOleh: user.name,
      bukti: bukti
        ? { nama: bukti.name, url: URL.createObjectURL(bukti) }
        : null,
      createdAt: offsetDate(0),
      answeredAt: null,
    }
    return adaptReport(toRawReport(report, user))
  },

  async answerIdentityRequest(id, status) {
    await delay()
    const user = requireUser()
    requireRole(user, ['santri'])
    const report = accessibleReport(user, id)
    const request = report.permintaanIdentitas
    if (!request) fail(404, 'Tidak ada permintaan untuk laporan ini.')
    const identityStatus =
      status === 1 || status === '1' || status === 'disetujui'
        ? 'disetujui'
        : status === 0 || status === '0' || status === 'ditolak'
          ? 'ditolak'
          : null
    if (request.status !== 'menunggu' || !identityStatus) {
      fail(409, 'Permintaan ini tidak bisa diubah lagi.')
    }
    request.status = identityStatus
    report.tampilkanIdentitas = identityStatus === 'disetujui'
    request.answeredAt = offsetDate(0)
    return adaptReport(toRawReport(report, user))
  },

  async updateStatus(id, status) {
    await delay()
    const user = requireUser()
    requireRole(user, ['pengurus', 'pimpinan'])
    const report = accessibleReport(user, id)
    if (!['baru', 'diproses', 'selesai'].includes(status)) {
      fail(422, 'Status tidak dikenal.', { status: ['Status tidak dikenal.'] })
    }
    report.status = status
    if (status !== 'baru') report.perluKlarifikasi = false
    return adaptReport(toRawReport(report, user))
  },

  async escalate(id, { tujuan, catatan }) {
    await delay()
    const user = requireUser()
    requireRole(user, ['pengurus', 'pimpinan'])
    const report = accessibleReport(user, id)
    if (!tujuan) {
      fail(422, 'Pilih tujuan eskalasi.', { tujuan: ['Pilih tujuan eskalasi.'] })
    }
    report.escalated = { tujuan, catatan: catatan ?? null, at: offsetDate(0) }
    return adaptReport(toRawReport(report, user))
  },
}

export const messages = {
  async getMessages(id) {
    await delay()
    const user = requireUser()
    const report = accessibleReport(user, id)
    return report.messages.map(toRawMessage).map(adaptMessage)
  },

  async sendMessage(id, body) {
    await delay()
    const user = requireUser()
    const report = accessibleReport(user, id)
    const text = String(body ?? '').trim()
    if (!text) {
      fail(422, 'Pesan tidak boleh kosong.', { body: ['Pesan tidak boleh kosong.'] })
    }
    const item = {
      id: nextMessageId(),
      from: user.role === 'santri' ? 'santri' : 'petugas',
      senderName: user.name,
      body: text,
      createdAt: offsetDate(0),
    }
    report.messages.push(item)
    return adaptMessage(toRawMessage(item))
  },
}

export const notes = {
  async addNote(id, body) {
    await delay()
    const user = requireUser()
    requireRole(user, ['pengurus', 'pimpinan'])
    const report = accessibleReport(user, id)
    const text = String(body ?? '').trim()
    if (!text) {
      fail(422, 'Catatan tidak boleh kosong.', { body: ['Catatan tidak boleh kosong.'] })
    }
    const item = {
      id: nextNoteId(),
      authorName: user.name,
      body: text,
      createdAt: offsetDate(0),
    }
    report.notes.push(item)
    return adaptNote({
      id: item.id,
      author_name: item.authorName,
      body: item.body,
      created_at: item.createdAt,
    })
  },
}

export const dashboard = {
  async getSummary() {
    await delay()
    const user = requireUser()
    requireRole(user, ['pimpinan'])
    return adaptSummary({
      total_santri: accounts.filter((account) => account.role === 'santri').length,
      total_laporan: reportStore.length,
      laporan_per_status: countBy(reportStore, 'status'),
      laporan_per_kategori: countBy(reportStore, 'kategori'),
    })
  },
}

const previewSantriImport = async (file) => {
  const uploadedRows = await readSantriWorkbook(file)
  const ids = new Map()
  const nisns = new Map()

  uploadedRows.forEach((row) => {
    if (row.idSantri) ids.set(row.idSantri, (ids.get(row.idSantri) ?? 0) + 1)
    if (row.nisn) nisns.set(row.nisn, (nisns.get(row.nisn) ?? 0) + 1)
  })

  const santriAccounts = accounts.filter((account) => account.role === 'santri')
  return {
    rows: uploadedRows.map((row) => {
      const errors = []
      const existing = row.idSantri
        ? santriAccounts.find((account) => String(account.id) === row.idSantri)
        : null

      if (!row.nisn) errors.push('NISN wajib diisi.')
      else if (!row.nisnIsText) {
        errors.push('NISN harus berformat teks agar angka nol di depan tidak hilang.')
      }
      if (!row.name) errors.push('Nama santri wajib diisi.')
      if (row.idSantri && ids.get(row.idSantri) > 1) {
        errors.push('ID Santri duplikat di dalam file.')
      }
      if (row.nisn && nisns.get(row.nisn) > 1) {
        errors.push('NISN duplikat di dalam file.')
      }
      if (row.idSantri && !existing) {
        errors.push('ID Santri tidak ditemukan.')
      }
      if (
        row.nisn &&
        santriAccounts.some(
          (account) =>
            String(account.nisn ?? account.username) === row.nisn &&
            String(account.id) !== row.idSantri,
        )
      ) {
        errors.push('NISN sudah digunakan akun santri lain.')
      }

      const action = !row.idSantri
        ? 'new'
        : existing?.name === row.name &&
            String(existing.nisn ?? existing.username) === row.nisn
          ? 'unchanged'
          : 'update'
      return {
        ...row,
        action,
        valid: errors.length === 0,
        errors,
      }
    }),
  }
}

export const admin = {
  async getTemplate() {
    await delay()
    const user = requireUser()
    requireRole(user, ['pimpinan'])
    return createSantriWorkbook([])
  },

  async getSantriExport() {
    await delay()
    const user = requireUser()
    requireRole(user, ['pimpinan'])
    const rows = accounts
      .filter((account) => account.role === 'santri')
      .map((account) => ({
        idSantri: account.id,
        nisn: account.nisn ?? account.username,
        name: account.name,
      }))
    return createSantriWorkbook(rows)
  },

  async previewImport(file) {
    await delay()
    const user = requireUser()
    requireRole(user, ['pimpinan'])
    return previewSantriImport(file)
  },

  async importSantri({ file, acknowledged }) {
    await delay(500)
    const user = requireUser()
    requireRole(user, ['pimpinan'])
    if (!acknowledged) {
      fail(422, 'Persetujuan wali santri wajib dicentang.', {
        acknowledged: ['Persetujuan wali santri wajib dicentang.'],
      })
    }
    const preview = await previewSantriImport(file)
    const invalidRows = preview.rows.filter((row) => !row.valid)
    if (invalidRows.length) {
      fail(422, 'Perbaiki baris yang bermasalah sebelum mengimpor.')
    }

    let created = 0
    let updated = 0
    let unchanged = 0
    const credentials = new Set(accounts.map((account) => account.password))
    const importedAccounts = []

    preview.rows.forEach((row) => {
      if (row.action === 'unchanged') {
        unchanged += 1
        return
      }
      if (row.action === 'update') {
        const account = accounts.find(
          (item) => String(item.id) === row.idSantri && item.role === 'santri',
        )
        account.name = row.name
        account.nisn = row.nisn
        account.username = row.nisn
        updated += 1
        return
      }

      const bytes = new Uint8Array(12)
      globalThis.crypto.getRandomValues(bytes)
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
      let temporaryPassword = `Sp${Array.from(
        bytes,
        (byte) => alphabet[byte % alphabet.length],
      ).join('')}!`
      while (credentials.has(temporaryPassword)) {
        globalThis.crypto.getRandomValues(bytes)
        temporaryPassword = `Sp${Array.from(
          bytes,
          (byte) => alphabet[byte % alphabet.length],
        ).join('')}!`
      }
      credentials.add(temporaryPassword)
      const id = Math.max(...accounts.map((account) => account.id)) + 1
      accounts.push({
        id,
        username: row.nisn,
        nisn: row.nisn,
        password: temporaryPassword,
        name: row.name,
        role: 'santri',
        active: true,
        mustChangePassword: true,
      })
      importedAccounts.push({
        name: row.name,
        username: row.nisn,
        temporaryPassword,
      })
      created += 1
    })

    return {
      created,
      updated,
      unchanged,
      accounts: importedAccounts,
    }
  },

  async getAccounts({ q, role, active } = {}) {
    await delay()
    const user = requireUser()
    requireRole(user, ['pimpinan'])
    let visible = [...accounts]
    if (q) {
      const term = String(q).toLowerCase()
      visible = visible.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.username.toLowerCase().includes(term),
      )
    }
    if (role) visible = visible.filter((item) => item.role === role)
    if (active !== undefined && active !== '' && active !== null) {
      const wanted = active === true || active === 'true'
      visible = visible.filter((item) => item.active === wanted)
    }
    return {
      items: visible.map((item) =>
        adaptAccount({
          id: item.id,
          username: item.username,
          name: item.name,
          role: item.role,
          active: item.active,
          must_change_password: item.mustChangePassword,
        }),
      ),
      meta: adaptPagination({
        current_page: 1,
        last_page: 1,
        total: visible.length,
      }),
    }
  },

  async createAccount(payload) {
    await delay()
    const user = requireUser()
    requireRole(user, ['pimpinan'])
    const errors = {}
    if (!payload.name) errors.name = ['Nama wajib diisi.']
    if (!payload.username) errors.username = ['ID pengguna wajib diisi.']
    if (!payload.role || payload.role === 'santri') {
      errors.role = ['Pilih peran petugas.']
    }
    if (payload.username && accounts.some((a) => a.username === payload.username)) {
      errors.username = ['ID pengguna sudah dipakai.']
    }
    if (Object.keys(errors).length) fail(422, 'Periksa kembali isian.', errors)
    const id = Math.max(...accounts.map((a) => a.id)) + 1
    const account = {
      id,
      username: payload.username,
      password: payload.password || 'petugas123',
      name: payload.name,
      role: payload.role,
      active: true,
      mustChangePassword: true,
    }
    accounts.push(account)
    return adaptAccount({
      id: account.id,
      username: account.username,
      name: account.name,
      role: account.role,
      active: account.active,
      must_change_password: account.mustChangePassword,
    })
  },

  async setAccountActive(id, active) {
    await delay()
    const user = requireUser()
    requireRole(user, ['pimpinan'])
    const account = accounts.find((item) => item.id === id)
    if (!account) fail(404, 'Akun tidak ditemukan.')
    account.active = Boolean(active)
    return adaptAccount({
      id: account.id,
      username: account.username,
      name: account.name,
      role: account.role,
      active: account.active,
      must_change_password: account.mustChangePassword,
    })
  },
}
