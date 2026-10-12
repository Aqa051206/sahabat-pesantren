// Data contoh untuk mode mock. Semua fiktif dan netral (tidak grafis).
// Tidak pernah memakai storage browser: state hidup di memori modul saja.

const pad = (value) => String(value).padStart(2, '0')

const iso = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const offsetDate = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return iso(date)
}

export const accounts = [
  {
    id: 1,
    username: 'santri1',
    password: 'santri123',
    name: 'Ahmad Fauzi',
    role: 'santri',
    active: true,
    mustChangePassword: false,
  },
  {
    id: 2,
    username: 'santri2',
    password: 'santri123',
    name: 'Siti Aminah',
    role: 'santri',
    active: true,
    mustChangePassword: true,
  },
  {
    id: 3,
    username: 'pengurus1',
    password: 'pengurus123',
    name: 'Ust. Rizal',
    role: 'pengurus',
    active: true,
    mustChangePassword: false,
  },
  {
    id: 4,
    username: 'pimpinan1',
    password: 'pimpinan123',
    name: 'KH. Abdullah',
    role: 'pimpinan',
    active: true,
    mustChangePassword: false,
  },
  {
    id: 5,
    username: 'pengurus2',
    password: 'pengurus123',
    name: 'Ustzh. Maryam',
    role: 'pengurus',
    active: false,
    mustChangePassword: false,
  },
]

// Nama pemilik laporan yang bukan akun login (data historis).
const peopleById = {
  100: 'Ridwan Hakim',
  101: 'Nur Hidayah',
  102: 'Fajar Ramadhan',
}

export const personName = (id) =>
  accounts.find((account) => account.id === id)?.name ?? peopleById[id] ?? null

let messageId = 100
let noteId = 100

const message = (from, senderName, body, daysAgo) => ({
  id: (messageId += 1),
  from,
  senderName,
  body,
  createdAt: offsetDate(daysAgo),
})

const note = (authorName, body, daysAgo) => ({
  id: (noteId += 1),
  authorName,
  body,
  createdAt: offsetDate(daysAgo),
})

export const reports = [
  {
    kode: 'SP-2026-0001',
    noLaporan: 1,
    ownerId: 1,
    kategori: 'perundungan',
    urgensi: 'perlu_perhatian',
    isi: 'Saya sering diejek soal asal daerah saya di kamar asrama saat waktu bebas.',
    tampilkanIdentitas: false,
    status: 'baru',
    penerima: 'pengurus',
    batasKlarifikasi: offsetDate(-1),
    perluKlarifikasi: true,
    escalated: null,
    createdAt: offsetDate(-2),
    messages: [],
    notes: [],
  },
  {
    kode: 'SP-2026-0002',
    noLaporan: 2,
    ownerId: 1,
    kategori: 'kekerasan_fisik',
    urgensi: 'darurat',
    isi: 'Ada teman yang mendorong saya sampai terjatuh di lapangan saat olahraga.',
    tampilkanIdentitas: true,
    status: 'diproses',
    penerima: 'pimpinan',
    batasKlarifikasi: offsetDate(-3),
    perluKlarifikasi: false,
    escalated: {
      tujuan: 'kepolisian',
      catatan: 'Sudah dilaporkan ke pihak berwenang bersama pimpinan.',
      at: offsetDate(-3),
    },
    createdAt: offsetDate(-4),
    messages: [
      message('santri', 'Ahmad Fauzi', 'Terima kasih sudah ditindaklanjuti, Pak.', -3),
      message('petugas', 'KH. Abdullah', 'Terima kasih sudah berani melapor. Kamu aman.', -3),
    ],
    notes: [
      note('Ust. Rizal', 'Sudah dikoordinasikan dengan wali kelas dan pengasuh asrama.', -3),
    ],
  },
  {
    kode: 'SP-2026-0003',
    noLaporan: 3,
    ownerId: 2,
    kategori: 'kekerasan_verbal',
    urgensi: 'biasa',
    isi: 'Ada yang membentak saya di depan teman-teman saat kegiatan malam.',
    tampilkanIdentitas: false,
    status: 'selesai',
    penerima: 'pengurus',
    batasKlarifikasi: offsetDate(-19),
    perluKlarifikasi: false,
    escalated: null,
    createdAt: offsetDate(-20),
    messages: [],
    notes: [],
  },
  {
    kode: 'SP-2026-0004',
    noLaporan: 4,
    ownerId: 100,
    kategori: 'masalah_pengurus',
    urgensi: 'perlu_perhatian',
    isi: 'Saya merasa ada perlakuan yang tidak adil saat pembagian tugas kebersihan.',
    tampilkanIdentitas: false,
    status: 'diproses',
    penerima: 'pimpinan',
    batasKlarifikasi: offsetDate(0),
    perluKlarifikasi: false,
    escalated: null,
    createdAt: offsetDate(-1),
    messages: [],
    notes: [note('Ust. Rizal', 'Menunggu arahan pimpinan.', -1)],
  },
  {
    kode: 'SP-2026-0005',
    noLaporan: 5,
    ownerId: 1,
    kategori: 'masalah_pribadi',
    urgensi: 'biasa',
    isi: 'Belakangan saya sulit tidur dan sering merasa cemas tanpa alasan jelas.',
    tampilkanIdentitas: false,
    status: 'baru',
    penerima: 'pengurus',
    batasKlarifikasi: offsetDate(1),
    perluKlarifikasi: false,
    escalated: null,
    createdAt: offsetDate(0),
    messages: [],
    notes: [],
  },
  {
    kode: 'SP-2026-0006',
    noLaporan: 6,
    ownerId: 2,
    kategori: 'perundungan',
    urgensi: 'biasa',
    isi: 'Saya dikucilkan dari kelompok belajar dan tidak ada yang mau duduk dekat saya.',
    tampilkanIdentitas: false,
    status: 'diproses',
    penerima: 'pengurus',
    batasKlarifikasi: offsetDate(-5),
    perluKlarifikasi: false,
    escalated: null,
    createdAt: offsetDate(-6),
    messages: [
      message('petugas', 'Ust. Rizal', 'Boleh cerita sejak kapan hal ini terjadi?', -5),
      message('santri', 'Siti Aminah', 'Sejak sekitar dua minggu lalu, Pak.', -5),
    ],
    notes: [],
  },
  {
    kode: 'SP-2026-0007',
    noLaporan: 7,
    ownerId: 101,
    kategori: 'kekerasan_verbal',
    urgensi: 'perlu_perhatian',
    isi: 'Ada yang mengatai saya dengan sebutan yang menyakitkan berulang kali.',
    tampilkanIdentitas: true,
    status: 'selesai',
    penerima: 'pengurus',
    batasKlarifikasi: offsetDate(-24),
    perluKlarifikasi: false,
    escalated: null,
    createdAt: offsetDate(-25),
    messages: [],
    notes: [],
  },
  {
    kode: 'SP-2026-0008',
    noLaporan: 8,
    ownerId: 1,
    kategori: 'lainnya',
    urgensi: 'biasa',
    isi: 'Saya ingin bertanya soal prosedur izin pulang, tidak tahu harus ke siapa.',
    tampilkanIdentitas: false,
    status: 'selesai',
    penerima: 'pengurus',
    batasKlarifikasi: offsetDate(-29),
    perluKlarifikasi: false,
    escalated: null,
    createdAt: offsetDate(-30),
    messages: [],
    notes: [],
  },
  {
    kode: 'SP-2026-0009',
    noLaporan: 9,
    ownerId: 2,
    kategori: 'masalah_pengurus',
    urgensi: 'biasa',
    isi: 'Ada pengurus yang menurut saya terlalu keras saat menegur kami.',
    tampilkanIdentitas: false,
    status: 'baru',
    penerima: 'pimpinan',
    batasKlarifikasi: offsetDate(-1),
    perluKlarifikasi: true,
    escalated: null,
    createdAt: offsetDate(-2),
    messages: [],
    notes: [],
  },
  {
    kode: 'SP-2026-0010',
    noLaporan: 10,
    ownerId: 100,
    kategori: 'kekerasan_fisik',
    urgensi: 'perlu_perhatian',
    isi: 'Saya pernah ditendang saat latihan, tapi saya takut memberi tahu nama pelakunya.',
    tampilkanIdentitas: false,
    status: 'diproses',
    penerima: 'pengurus',
    batasKlarifikasi: offsetDate(-4),
    perluKlarifikasi: false,
    escalated: {
      tujuan: 'sapa_129',
      catatan: 'Konsultasi dengan layanan SAPA 129.',
      at: offsetDate(-4),
    },
    createdAt: offsetDate(-5),
    messages: [],
    notes: [],
  },
  {
    kode: 'SP-2026-0011',
    noLaporan: 11,
    ownerId: 102,
    kategori: 'perundungan',
    urgensi: 'biasa',
    isi: 'Ada yang mengambil barang saya tanpa izin dan tidak mengembalikannya.',
    tampilkanIdentitas: false,
    status: 'selesai',
    penerima: 'pengurus',
    batasKlarifikasi: offsetDate(-39),
    perluKlarifikasi: false,
    escalated: null,
    createdAt: offsetDate(-40),
    messages: [],
    notes: [],
  },
  {
    kode: 'SP-2026-0012',
    noLaporan: 12,
    ownerId: 1,
    kategori: 'masalah_pribadi',
    urgensi: 'perlu_perhatian',
    isi: 'Saya sedang rindu rumah dan sulit fokus belajar belakangan ini.',
    tampilkanIdentitas: false,
    status: 'baru',
    penerima: 'pengurus',
    batasKlarifikasi: offsetDate(0),
    perluKlarifikasi: false,
    escalated: null,
    createdAt: offsetDate(-1),
    messages: [],
    notes: [],
  },
]

let reportSequence = reports.length

export const nextReportKode = () => {
  reportSequence += 1
  return {
    kode: `SP-2026-${String(reportSequence).padStart(4, '0')}`,
    noLaporan: reportSequence,
  }
}

export const nextMessageId = () => (messageId += 1)
export const nextNoteId = () => (noteId += 1)
