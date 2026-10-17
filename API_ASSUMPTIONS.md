# Asumsi & Catatan API

Daftar endpoint yang dipakai frontend. Kontrak beku hanya memastikan **metode
dan jalur endpoint**; semua bentuk request/response dan semantik yang tidak
disebutkan tetap merupakan asumsi sampai dikonfirmasi tim backend.

## Simbol status

- ✅ Metode dan jalur endpoint dipastikan di kontrak beku.
- ⚠️ Bentuk data atau semantik adalah asumsi yang perlu dikonfirmasi.

## Auth

- ✅ `POST /api/v1/auth/login`
- ✅ `POST /api/v1/auth/password`
- ✅ `POST /api/v1/logout`
- ⚠️ Request login yang digunakan frontend `{ identifier, password }`.
  Respons mendukung `{ data: { token, user } }` dan objek langsung
  `{ access_token, user, message }`; field pengguna `must_change_password`
  dipetakan ke `mustChangePassword`.
- ⚠️ Asumsi request ganti kata sandi `{ current_password, new_password }`; respons `{ data: { ok } }`.
- ⚠️ Asumsi bentuk `user`: `{ id, name, role, must_change_password }`, dengan
  `role ∈ { santri, pengurus, pimpinan }`.

## Laporan

- ✅ `POST /api/v1/reports`
- ✅ `GET /api/v1/reports/mine`
- ✅ `GET /api/v1/reports`
- ✅ `GET /api/v1/reports/{id}`
- ✅ `PATCH /api/v1/reports/{id}/identity`
- ✅ `PATCH /api/v1/reports/{id}/status`
- ✅ `POST /api/v1/reports/{id}/escalate`
- ✅ `GET /api/v1/reports/{id}/messages`
- ✅ `POST /api/v1/reports/{id}/messages`
- ✅ `POST /api/v1/reports/{id}/notes`

⚠️ Bentuk model laporan yang dikonfirmasi: `{ id, users_id, no_laporan,
  kategori, isi, tampilkan_identitas, status, waktu }`. Frontend memakai `id`
  sebagai parameter detail, `no_laporan` sebagai nomor yang ditampilkan, dan
  `waktu` sebagai tanggal laporan.
⚠️ Asumsi request: membuat laporan `{ kategori, isi, tampilkan_identitas }`;
  server menentukan `users_id`, `no_laporan`, `status`, dan `waktu`.
  Memperbarui identitas `{ tampilkan_identitas }`;
  memperbarui status `{ status }`; eskalasi `{ tujuan, catatan }`; catatan
  internal `{ body }`.
⚠️ Asumsi daftar laporan santri memakai `?page=`; daftar petugas memakai
`?page=&status=&kategori=`.
⚠️ Asumsi endpoint pesan menyediakan percakapan dua arah pelapor–petugas dan
endpoint catatan internal hanya dapat digunakan petugas.

### Asumsi bentuk laporan (`data`)

Field model yang digunakan frontend:

- `id`, `users_id`, `no_laporan`
- `kategori`, `isi`
- `tampilkan_identitas` (boolean)
- `status`, `waktu` (tanggal)

Field tambahan berikut bukan bagian dari `$fillable` yang dikonfirmasi; UI
hanya menggunakannya bila API memang mengirimkannya:

- `penerima` (`pengurus` | `pimpinan`)
- `batas_klarifikasi`, `dieskalasi_tujuan`, `dieskalasi_catatan`,
  `dieskalasi_at`, `perlu_klarifikasi`
- `pelapor_nama` — **hanya terisi bila `tampilkan_identitas = true`**. Inilah
  satu-satunya cara identitas pelapor tampil di UI petugas. Nilai
  `tampilkan_identitas` adalah persetujuan santri yang berlaku untuk pengurus
  dan pimpinan; bila nilainya `false`, UI wajib menyamarkan nama meskipun
  `pelapor_nama` terisi.
- `catatan_internal` — array `{ id, body, author_name, created_at }`, hanya
  dikembalikan untuk staff.

⚠️ Asumsi paginasi daftar:
`{ data: [...], meta: { current_page, last_page, total } }`.

## Dashboard

- ✅ `GET /api/v1/dashboard/summary`

⚠️ Respons ringkasan `{ data: { total_santri, total_laporan,
laporan_per_status: { baru, diproses, selesai }, laporan_per_kategori } }`.
Frontend memetakan field ini melalui `adaptSummary` di `src/api/adapters.js`.
Endpoint ini hanya digunakan untuk dashboard pimpinan. Dashboard pengurus
menghitung ringkasan dari `GET /api/v1/reports` dan filter status, sehingga
data yang dihitung mengikuti laporan yang memang dapat diakses peran tersebut.

## Impor santri (Excel/CSV)

- ✅ `GET /api/v1/admin/santri/template`
- ✅ `POST /api/v1/admin/santri/import`

⚠️ Asumsi: respons template `{ data: { filename, columns, rows } }`.
Template dari endpoint mock berupa CSV, sedangkan PRD menyebut template Excel.
Frontend mengasumsikan file impor berukuran ≤ 2 MB dengan ekstensi
`.csv/.xlsx/.xls`. Tidak ada endpoint preview terpisah yang diketahui; frontend
memanggil endpoint impor yang sama dengan parameter `?preview=1` dan berharap respons
`{ data: { rows: [{ index, name, nis, kelas, valid, errors[] }] } }`. Bila ada
endpoint khusus, ubah `previewImport` di `src/api/services/admin.js`.

⚠️ Bentuk respons impor final yang diharapkan:
`{ data: { imported: number, accounts: [{ name, username, role, temporary_password }] } }`.

## Akun petugas — ⚠️ DIASUMSIKAN SELURUHNYA

Belum ada di kontrak beku. F-17 menyebut pimpinan membuat dan menonaktifkan
akun, tetapi endpoint kelola akun belum tercantum di kontrak. Frontend memakai:

- ⚠️ `GET /api/v1/admin/accounts` — `?q=&role=&active=` → `{ data: [...], meta }`
- ⚠️ `POST /api/v1/admin/accounts` — `{ name, username, role, password? }`
- ⚠️ `PATCH /api/v1/admin/accounts/{id}/status` — `{ active }`

Field akun: `{ id, username, name, role, active, must_change_password }`.
Jika backend memakai jalur/bentuk lain, sesuaikan di `src/api/services/admin.js`
dan `adaptAccount` di `src/api/adapters.js`.

Bila hanya import yang tersedia dan tidak ada CRUD akun, buang/umpan-kunci
seksi "Akun Petugas" di `src/pages/pimpinan/AccountsPage.jsx`.

## Asumsi error

⚠️ Frontend mengharapkan:

- `401` → token kedaluwarsa → logout otomatis.
- `403` → akses ditolak (angka `403`/login sengaja tidak diberitahu).
- `404` → laporan/akun tidak ditemukan.
- `422` → validasi; `{ errors: { field: [pesan] } }` bila ada.
- `429` → batas harian laporan tercapai.

## Pemeriksaan kesehatan (health check)

- ✅ `GET /api/v1/health`
- Endpoint ini opsional dipakai untuk kios/demo.

## Pertanyaan untuk tim backend

1. Apa nama field login yang benar: `identifier`, atau `username`/`nis`/`email`?
   PRD menyebut “NIS atau email”.
2. Apakah respons dibungkus `{ data }`, dan bagaimana bentuk tepat paginasi
   (termasuk nama field `meta`)?
3. Apa bentuk pesan percakapan (`from`, `sender_name`), dan apakah pesan santri
   dikirim sebagai `from: "santri"` saat dilihat petugas?
4. Apakah tersedia endpoint preview impor khusus, atau memang memakai
   `?preview=1` pada endpoint impor?
5. Endpoint `/admin/accounts` tidak ada di kontrak beku. Bagaimana pimpinan
   membuat dan menonaktifkan akun seperti yang diminta F-17?
6. Apakah field `perlu_klarifikasi` dikirim oleh server?
7. Apakah impor menerima `.xlsx` saja (PRD menyebut Excel), atau juga `.csv`
   dan `.xls`?
8. Apakah isi laporan memiliki batas panjang di backend? Frontend dan mode mock
   tidak lagi membatasi panjang cerita.

## Keamanan (TODO)

- CSP aktif (`public/_headers`, `vercel.json`) memakai `connect-src 'self'`.
  **TODO sebelum rilis**: tambahkan origin API, mis.
  `connect-src 'self' https://api.domain.example`, begitu domain final diketahui.
- Semua komunikasi harus HTTPS; `upgrade-insecure-requests` sudah dipasang.