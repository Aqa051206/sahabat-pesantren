// Pemetaan field JSON API -> model aplikasi. Ubah di sini bila bentuk
// respons backend berubah, supaya komponen tidak perlu ikut berubah.

export const adaptUser = (raw) =>
  raw
    ? {
        id: raw.id,
        name: raw.name,
        role: raw.role,
        mustChangePassword: Boolean(raw.must_change_password),
      }
    : null

export const adaptMessage = (raw) => ({
  id: raw.id,
  body: raw.body,
  from: raw.from,
  senderName: raw.sender_name ?? null,
  createdAt: raw.created_at ?? null,
})

export const adaptNote = (raw) => ({
  id: raw.id,
  body: raw.body,
  authorName: raw.author_name ?? null,
  createdAt: raw.created_at ?? null,
})

export const adaptReport = (raw) =>
  raw
    ? {
        id: raw.id,
        noLaporan: raw.no_laporan,
        kategori: raw.kategori,
        isi: raw.isi,
        tampilkanIdentitas: Boolean(raw.tampilkan_identitas),
        status: raw.status,
        penerima: raw.penerima,
        batasKlarifikasi: raw.batas_klarifikasi ?? null,
        dieskalasiTujuan: raw.dieskalasi_tujuan ?? null,
        dieskalasiCatatan: raw.dieskalasi_catatan ?? null,
        dieskalasiAt: raw.dieskalasi_at ?? null,
        createdAt: raw.waktu ?? raw.created_at ?? null,
        pelaporNama: raw.pelapor_nama ?? null,
        perluKlarifikasi: Boolean(raw.perlu_klarifikasi),
        catatan: Array.isArray(raw.catatan_internal)
          ? raw.catatan_internal.map(adaptNote)
          : [],
      }
    : null

export const adaptAccount = (raw) => ({
  id: raw.id,
  username: raw.username,
  name: raw.name,
  role: raw.role,
  active: Boolean(raw.active),
  mustChangePassword: Boolean(raw.must_change_password),
})

export const adaptPagination = (meta) => ({
  currentPage: meta?.current_page ?? 1,
  lastPage: meta?.last_page ?? 1,
  total: meta?.total ?? 0,
})

export const adaptSummary = (raw) => ({
  total: raw?.total ?? 0,
  perStatus: raw?.per_status ?? {},
  perKategori: raw?.per_kategori ?? {},
})
