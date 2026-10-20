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
- ⚠️ `POST /api/v1/reports/{id}/identity-request` dan
  `PATCH /api/v1/reports/{id}/identity-request` (permintaan dan jawaban izin
  melihat identitas; belum termasuk kontrak beku). Jawaban menerima
  `status: 1` (setuju) atau `status: 0` (tolak); mencabut persetujuan memakai
  `PATCH /reports/{id}/identity` dengan `tampilkan_identitas: false`.

⚠️ Bentuk model laporan yang dikonfirmasi: `{ id, users_id, no_laporan,
  kategori, isi, tampilkan_identitas, status, waktu }`. Frontend memakai `id`
  sebagai parameter detail, `no_laporan` sebagai nomor yang ditampilkan, dan
  `waktu` sebagai tanggal laporan.
⚠️ Asumsi request: membuat laporan `{ kategori, isi, tampilkan_identitas }`;
  server menentukan `users_id`, `no_laporan`, `status`, dan `waktu`.
  Memperbarui identitas `{ tampilkan_identitas }`;
  memperbarui status `{ status }`; eskalasi `{ tujuan, catatan }`.
⚠️ Daftar laporan santri dan petugas mengambil semua halaman API memakai
`?page=` lalu menerapkan filter status, kategori, dan kode laporan serta
pagination di frontend. Respons paginator diharapkan menyediakan `last_page`
(atau `total` dan `per_page`) agar semua halaman bisa dimuat.
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
- `pelapor_nama` — nama ditampilkan kepada pengurus dan pimpinan bila
  `tampilkan_identitas = true`. Jika nilainya `false`, nama hanya boleh
  dikirim kepada pimpinan bila `permintaan_identitas.status` bernilai
  `disetujui`; persetujuan permintaan tidak membuka nama kepada pengurus.
  Perubahan status laporan tidak membuka identitas, dan tidak ada override
  paksa pimpinan. UI tetap menyamarkan nama bila API tidak mengirim
  `pelapor_nama`.
- `permintaan_identitas` (opsional) — asumsi respons `{ status, alasan,
  diminta_oleh, bukti_nama, bukti_url, dibuat, dijawab }`. Status jawaban
  `disetujui` atau `ditolak`; frontend menormalkan `true`/`1` menjadi
  `disetujui` dan `false`/`0` menjadi `ditolak`.
- `catatan_internal` — array `{ id, body, author_name, created_at }`, hanya
  dikembalikan untuk staff. Backend yang didokumentasikan menerima catatan
  melalui `POST /reports/{laporan}/notes` dengan body `{ catatan }`; respons
  `Catatan` berisi `id`, `catatan`, `users_id`, dan timestamps, tetapi detail
  laporan belum mendokumentasikan daftar catatan maupun nama pengirim.

Frontend mengirim field `catatan` dan menampilkan nama petugas yang sedang
menulis pada respons saat ini. Agar catatan tetap muncul setelah logout/login
dan nama penulis tersedia, backend perlu mengembalikan `catatan_internal` pada
`GET /reports/{laporan}` dengan data catatan tersimpan dan relasi
`user.name`/`author_name`. Catatan sensitif tidak disimpan di localStorage.

Permintaan izin memakai multipart dengan `alasan` wajib dan `bukti` opsional;
frontend tidak mengirim field `bukti` bila berkas tidak dipilih. Bukti yang
dilampirkan berupa JPG/PNG atau PDF, maksimal 5 MB.

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

## Impor dan ekspor santri (XLSX)

Base URL yang ditampilkan dokumentasi backend adalah
`https://www.piancollections.my.id/api`; frontend menggunakan base URL tersebut
dengan menambahkan prefix `/api` ke origin.

### Kontrak backend saat ini (dokumentasi `/docs/api`)

- ✅ `GET /api/admin/santri/template` — respons berkas XLSX dengan kolom
  `name`, `email`, `nis`, `jenis_kelamin`, dan `telepon_ortu`.
- ✅ `POST /api/admin/santri/import` — multipart dengan field `action`
  (`preview` atau `import`) dan `file`.
- ✅ `GET /api/santri` — daftar `{ santri: [...], message }`; dokumentasi
  menggunakan schema `User` (id, name, email, role, status), bukan NISN.
- ⚠️ Tidak ada `GET /api/admin/santri/export` pada dokumentasi yang diperiksa.

Untuk preview, kirim `action=preview`. Respons berisi `data` (baris dengan
`row`, `name`, `email`, `nis`, `jenis_kelamin`, `telepon_ortu`, `valid`),
`errors`, `can_import`, dan `message`. Untuk impor final, kirim
`action=import`; respons berisi `imported` dan `message`. Batas file yang
terdokumentasi 5120 KB. Frontend mengikuti format dan batas tersebut.

Kontrak ini membuat akun baru; belum mendukung pembaruan berdasarkan ID Santri
atau ekspor XLSX. `GET /api/santri` juga belum mendokumentasikan NIS. Alur
unduh → edit → unggah untuk memperbarui data santri yang sudah ada tetap
memerlukan kontrak/endpoint backend tambahan. Jangan menghapus baris yang
hilang atau menyamakan `nis` dengan NISN tanpa konfirmasi backend.

## Akun petugas — ⚠️ DIASUMSIKAN SELURUHNYA

Dokumentasi backend saat ini menyediakan `GET /api/admin/accounts` dan
`PATCH /api/admin/accounts/{user}/status`. Respons daftar berupa
`{ data: [User], message }`; frontend memetakan `email` sebagai ID pengguna dan
`is_active` sebagai status aktif. Pencarian dan filter dilakukan lokal di UI.

Belum ada endpoint pembuatan akun di dokumentasi. Frontend masih memakai
asumsi berikut, sehingga pembuatan akun petugas produksi perlu dikonfirmasi:

- ⚠️ `POST /api/admin/accounts` — `{ name, username, role, password? }`
- ⚠️ `PATCH /api/admin/accounts/{user}/status` — route dan respons
  didokumentasikan, tetapi request body belum didokumentasikan.

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