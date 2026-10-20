// Pemetaan field JSON API -> model aplikasi. Ubah di sini bila bentuk
// respons backend berubah, supaya komponen tidak perlu ikut berubah.

export const adaptUser = (raw) =>
  raw
    ? {
        id: raw.id,
        name: raw.name,
        role: raw.role,
        mustChangePassword:
          raw.role === 'pengurus' ? false : Boolean(raw.must_change_password),
      }
    : null

export const adaptMessage = (raw) => ({
  id: raw.id,
  body: raw.isi ?? raw.body,
  from: raw.pengirim?.role ?? raw.from ?? null,
  senderId: raw.sender_id ?? raw.pengirim?.id ?? raw.pengirim?.users_id ?? null,
  senderName: raw.sender_name ?? raw.pengirim?.name ?? null,
  createdAt: raw.created_at ?? null,
})

export const adaptNote = (raw) => ({
  id: raw.id,
  body: raw.catatan ?? raw.body,
  authorName:
    raw.author_name ??
    raw.user?.name ??
    raw.pengirim?.name ??
    raw.users?.name ??
    raw.author?.name ??
    null,
  createdAt: raw.created_at ?? null,
})

export const adaptIdentityRequest = (raw) =>
  raw
    ? {
        status:
          raw.status === true || raw.status === 1 || raw.status === '1'
            ? 'disetujui'
            : raw.status === false ||
                raw.status === 0 ||
                raw.status === '0'
              ? 'ditolak'
            : raw.status,
        alasan: raw.alasan,
        diminta: raw.diminta_oleh ?? null,
        buktiNama: raw.bukti_nama ?? null,
        buktiUrl: raw.bukti_url ?? null,
        createdAt: raw.dibuat ?? null,
        answeredAt: raw.dijawab ?? null,
      }
    : null

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
        pelaporNama: raw.pelapor_nama ?? raw.user?.name ?? null,
        perluKlarifikasi: Boolean(raw.perlu_klarifikasi),
        permintaanIdentitas: adaptIdentityRequest(raw.permintaan_identitas),
        catatan: Array.isArray(raw.catatan_internal ?? raw.catatans)
          ? (raw.catatan_internal ?? raw.catatans).map(adaptNote)
          : [],
      }
    : null

export const adaptAccount = (raw) => {
  const user = raw.user ?? raw
  const active = user.active ?? user.is_active
  return {
    id: user.id ?? raw.users_id,
    username:
      raw.nis ??
      raw.santri?.nis ??
      raw.username ??
      user.email ??
      raw.email ??
      raw.id_pengguna ??
      null,
    name: user.name ?? raw.name ?? null,
    role: user.role ?? raw.role,
    active:
      active === true ||
      active === 1 ||
      active === '1' ||
      active === 'true',
    mustChangePassword: Boolean(
      user.must_change_password ?? raw.must_change_password,
    ),
  }
}

export const adaptPagination = (meta, itemCount = 0) => {
  const currentPage = Number(meta?.current_page ?? meta?.currentPage ?? 1)
  const total = Number(
    meta?.total ?? meta?.total_count ?? meta?.count ?? itemCount,
  )
  const perPage = Number(meta?.per_page ?? meta?.perPage ?? (itemCount || 1))
  const lastPage = Number(
    meta?.last_page ??
      meta?.lastPage ??
      Math.max(1, Math.ceil(total / perPage)),
  )
  return { currentPage, lastPage, total, perPage }
}

export const adaptSummary = (raw) => ({
  totalSantri: raw?.total_santri ?? 0,
  totalLaporan: raw?.total_laporan ?? 0,
  perStatus: raw?.laporan_per_status ?? {},
  perKategori: raw?.laporan_per_kategori ?? {},
})
