// Sumber kebenaran tunggal untuk label & konstanta domain.
// Jangan mendefinisikan label kategori/status di tempat lain.

export const ROLES = {
  SANTRI: 'santri',
  PENGURUS: 'pengurus',
  PIMPINAN: 'pimpinan',
}

export const ROLE_LABELS = {
  [ROLES.SANTRI]: 'Santri',
  [ROLES.PENGURUS]: 'Pengurus',
  [ROLES.PIMPINAN]: 'Pimpinan',
}

export const CATEGORIES = [
  {
    value: 'perundungan',
    label: 'Perundungan',
    description: 'Diejek, dikucilkan, atau diganggu terus-menerus.',
  },
  {
    value: 'kekerasan_fisik',
    label: 'Kekerasan fisik',
    description: 'Dipukul, ditendang, atau disentuh tanpa izin.',
  },
  {
    value: 'kekerasan_verbal',
    label: 'Kekerasan verbal',
    description: 'Dibentak, dihina, atau diancam dengan kata-kata.',
  },
  {
    value: 'masalah_pengurus',
    label: 'Masalah dengan pengurus',
    description: 'Perilaku pengurus yang membuatmu tidak nyaman.',
  },
  {
    value: 'masalah_pribadi',
    label: 'Masalah pribadi',
    description: 'Sedang sedih, cemas, atau butuh teman bicara.',
  },
  {
    value: 'lainnya',
    label: 'Lainnya',
    description: 'Sesuatu yang belum cocok dengan pilihan di atas.',
  },
]

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((item) => [item.value, item.label]),
)

export const STATUSES = [
  { value: 'baru', label: 'Baru', tone: 'new' },
  { value: 'diproses', label: 'Diproses', tone: 'process' },
  { value: 'selesai', label: 'Selesai', tone: 'done' },
]

export const STATUS_LABELS = Object.fromEntries(
  STATUSES.map((item) => [item.value, item.label]),
)

export const ESCALATION_TARGETS = [
  { value: 'pimpinan', label: 'Pimpinan pesantren' },
  { value: 'sapa_129', label: 'Layanan SAPA 129' },
  { value: 'kepolisian', label: 'Kepolisian' },
  { value: 'dinas_p3a', label: 'Dinas P3A / PPPA' },
  { value: 'lainnya', label: 'Lainnya' },
]

export const ESCALATION_TARGET_LABELS = Object.fromEntries(
  ESCALATION_TARGETS.map((item) => [item.value, item.label]),
)

export const REPORT_RECIPIENTS = {
  pengurus: 'Pengurus',
  pimpinan: 'Pimpinan',
}

// Laporan tentang pengurus diteruskan langsung ke pimpinan.
export const routesToPimpinan = ({ kategori }) =>
  kategori === 'masalah_pengurus'

export const PAGE_SIZE = 8

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024

export const HOME_BY_ROLE = {
  [ROLES.SANTRI]: '/santri/buat-laporan',
  [ROLES.PENGURUS]: '/petugas',
  [ROLES.PIMPINAN]: '/pimpinan/dashboard',
}

export const homeForRole = (role) => HOME_BY_ROLE[role] ?? '/'
