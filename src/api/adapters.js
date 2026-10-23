// Pemetaan field JSON API -> model aplikasi. Ubah di sini bila bentuk
// respons backend berubah, supaya komponen tidak perlu ikut berubah.

export const adaptUser = (raw) =>
  raw
    ? {
        id: raw.id,
        name: raw.name,
        role: raw.role,
        email: raw.email ?? null,
        nis: raw.nis ?? raw.santri?.nis ?? null,
        phone: raw.telepon_ortu ?? raw.santri?.telepon_ortu ?? raw.phone ?? null,
        username: raw.username ?? null,
        mustChangePassword: Boolean(raw.must_change_password),
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
            : raw.status === 2 || raw.status === '2'
              ? 'dicabut'
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
        statusChangedAt: raw.status_diubah ?? null,
        // Waktu baca per peran dipakai untuk menurunkan notifikasi saat
        // endpoint daftar notifikasi belum tersedia di backend.
        readAt: {
          santri: raw.santri_dibaca ?? null,
          pengurus: raw.pengurus_dibaca ?? null,
          pimpinan: raw.pimpinan_dibaca ?? null,
        },
        messages: Array.isArray(raw.percakapans ?? raw.messages)
          ? (raw.percakapans ?? raw.messages).map(adaptMessage)
          : [],
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

export const adaptNotificationSummary = (raw) => ({
  permintaanIdentitas: raw?.permintaan_identitas ?? 0,
  pesanBaru: raw?.pesan_baru ?? 0,
  statusDiubah: raw?.status_diubah ?? 0,
  laporanBaru: raw?.laporan_baru ?? 0,
  total:
    raw?.pembaruan ??
    (raw?.permintaan_identitas ?? 0) +
      (raw?.pesan_baru ?? 0) +
      (raw?.status_diubah ?? 0) +
      (raw?.laporan_baru ?? 0),
})

export const adaptNotification = (raw) =>
  raw
    ? {
        id: raw.id ?? `${raw.tipe}:${raw.laporan_id ?? raw.report_id}`,
        tipe: raw.tipe ?? raw.type ?? null,
        laporanId: raw.laporan_id ?? raw.report_id ?? raw.laporan?.id ?? null,
        noLaporan:
          raw.no_laporan ?? raw.laporan?.no_laporan ?? raw.report?.no_laporan ?? null,
        kategori: raw.kategori ?? raw.laporan?.kategori ?? raw.report?.kategori ?? null,
        waktu: raw.waktu ?? raw.created_at ?? raw.updated_at ?? null,
        statusBaru: raw.status_baru ?? raw.status ?? null,
        pengirim:
          raw.pengirim?.name ??
          raw.sender_name ??
          raw.sender?.name ??
          (typeof raw.pengirim === 'string' ? raw.pengirim : null),
        preview: raw.preview ?? raw.isi ?? raw.pesan ?? null,
      }
    : null

export const adaptNotificationList = (raw) => {
  const body = raw ?? {}
  const payload = body.data ?? body
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.data)
        ? payload.data
        : []
  const meta = payload.meta ?? body.meta ?? body.pagination ?? payload.pagination
  return {
    items: items.map(adaptNotification).filter(Boolean),
    meta: adaptPagination(meta, items.length),
  }
}

export const adaptSummary = (raw) => ({
  totalSantri: raw?.total_santri ?? 0,
  totalLaporan: raw?.total_laporan ?? 0,
  perStatus: raw?.laporan_per_status ?? {},
  perKategori: raw?.laporan_per_kategori ?? {},
})
