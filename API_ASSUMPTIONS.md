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
- ⚠️ Request ganti kata sandi mengirim
  `{ current_password, password, password_confirmation }`; nama field
  `password` mengikuti error validasi aktual backend ("The password field is
  required."). Password baru minimal 8 karakter; respons `{ data: { ok } }`.
- ⚠️ Asumsi bentuk `user`: `{ id, name, role, must_change_password }`, dengan
  `role ∈ { santri, pengurus, pimpinan }`.

## Notifikasi

- Terverifikasi: `GET /api/v1/notifications/summary` dipakai untuk badge menu
  Notifikasi dan total pada halaman Notifikasi.
- Respons `data` berupa objek. Contoh santri:

  ```json
  {
    "message": "Berhasil mengambil notifikasi.",
    "code": "NOTIFICATION_FETCH_SUCCESS",
    "data": {
      "permintaan_identitas": 1,
      "pesan_baru": 0,
      "status_diubah": 2,
      "pembaruan": 3
    }
  }
  ```

  Contoh pengurus/pimpinan:

  ```json
  {
    "data": {
      "laporan_baru": 17,
      "pesan_baru": 2,
      "pembaruan": 19
    }
  }
  ```

- Santri memakai kategori `permintaan_identitas`, `pesan_baru`, dan
  `status_diubah`. Pengurus dan pimpinan memakai `laporan_baru` dan
  `pesan_baru`. Kategori yang tidak berlaku tidak dikirim; frontend
  menganggapnya `0`.
- `pembaruan` adalah jumlah semua kategori per laporan. Satu laporan dapat
  dihitung pada lebih dari satu kategori.
- Trigger santri: permintaan identitas berstatus `menunggu` yang lebih baru
  dari waktu baca terakhir, pesan dari pengguna lain setelah waktu baca, dan
  status laporan yang berubah setelah waktu baca.
- Trigger pengurus/pimpinan: laporan berstatus `baru` yang belum pernah dibuka
  oleh role tersebut, serta pesan dari pengguna lain pada laporan yang belum
  `selesai` setelah waktu baca terakhir.
- `GET /api/v1/reports/{id}` dan `GET /api/v1/reports/{id}/messages` otomatis
  menandai laporan sudah dibaca untuk role yang sedang login. Frontend
  menginvalidasi ringkasan dan daftar notifikasi setelah laporan atau pesan
  dimuat.
- ✅ Terverifikasi (23 Okt 2026): `GET /api/v1/notifications?page=1&per_page=100`
  mengembalikan `{ message, code, data: { items, meta } }`. `items` sudah
  hanya berisi notifikasi yang belum dibaca dan diurutkan terbaru.
- Bentuk item: `{ id, tipe, laporan_id, no_laporan, kategori, waktu,
  status_baru, pengirim, preview, url }`. `id` numerik dan unik
  (`laporan_id * 10 + kode kategori`); `status_baru` string/null;
  `pengirim` berupa `{ id, name, role }` atau null bila identitas santri
  disembunyikan (adapter mengambil `name`); `waktu` ISO 8601.
- `tipe ∈ laporan_baru | pesan_baru | status_diubah | permintaan_identitas`.
  Frontend mengambil semua halaman (`per_page=100`) dan deduplikasi
  berdasarkan `id`.
- Jika endpoint daftar mengembalikan `404`, frontend memakai fallback:
  menurunkan daftar dari `GET /reports/mine` (santri) atau `GET /reports`
  (pengurus/pimpinan) memakai `santri_dibaca`, `pengurus_dibaca`,
  `pimpinan_dibaca`, `status_diubah`, `permintaan_identitas`, dan
  `percakapans`.
- Halaman Notifikasi menampilkan item individual dan klik langsung membuka
  detail laporan. Setelah detail/pesan dibuka, ringkasan **dan** daftar
  notifikasi diinvalidasi.
- Frontend memantau ringkasan dan daftar notifikasi setiap 30 detik serta
  saat jendela kembali aktif.
- Sudah diuji dengan akun asli: kategori laporan baru, pesan baru, status
  berubah, dan permintaan identitas bertambah sesuai aksi dan kembali turun
  setelah laporan/pesan dibaca.

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
  `PATCH /reports/{id}/identity` dengan `tampilkan_identitas: false`. Bila
  permintaan terbaru sedang `disetujui`, backend mengubahnya menjadi `dicabut`
  dan mengisi `dijawab`; menyalakan kembali switch mengubah `dicabut` menjadi
  `disetujui`. Permintaan baru ditolak `409` selama masih ada permintaan
  `menunggu` atau `disetujui`.

⚠️ Bentuk model laporan yang dikonfirmasi: `{ id, users_id, no_laporan,
  kategori, isi, tampilkan_identitas, status, waktu }`. Frontend memakai `id`
  sebagai parameter detail, `no_laporan` sebagai nomor yang ditampilkan, dan
  `waktu` sebagai tanggal laporan.
⚠️ Asumsi request: membuat laporan `{ kategori, isi, tampilkan_identitas }`;
  server menentukan `users_id`, `no_laporan`, `status`, dan `waktu`.
  Memperbarui identitas `{ tampilkan_identitas }`;
  memperbarui status `{ status }`; eskalasi `{ tujuan, catatan }`; catatan
  internal `{ catatan }`; pesan percakapan `{ isi }`.
⚠️ Daftar laporan santri dan petugas mengambil semua halaman API memakai
`?page=` lalu menerapkan filter status, kategori, dan kode laporan serta
pagination di frontend. Respons paginator diharapkan menyediakan `last_page`
(atau `total` dan `per_page`) agar semua halaman bisa dimuat.
⚠️ Asumsi endpoint pesan menyediakan percakapan dua arah pelapor–petugas dan
endpoint catatan internal hanya dapat digunakan petugas. Pesan dikirim dengan
field `isi`; adapter menerima isi respons dari `isi` (serta `pengirim.name`
untuk nama pengirim) dan mempertahankan model internal frontend.

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
  `menunggu`, `disetujui`, `ditolak`, atau `dicabut`; frontend menormalkan
  `true`/`1` menjadi `disetujui`, `false`/`0` menjadi `ditolak`, dan `2`
  menjadi `dicabut`.
- `catatan_internal` atau `catatans` — array `{ id, catatan, users_id,
  laporan_id, created_at, updated_at, user? }`, hanya dikembalikan untuk staff.
  Frontend memetakan `catatan` menjadi isi catatan dan mengambil nama penulis
  dari `author_name` atau `user.name`.

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

## Impor dan ekspor santri (Excel)

- ✅ `GET /api/admin/santri/template` — route template backend.
- ✅ `POST /api/admin/santri/import` — multipart `action=preview|import` dan `file`.
- ✅ `GET /api/admin/santri/export` — route ekspor dikonfirmasi backend.
  Frontend saat ini membuat template kosong lokal dengan kolom
  `name`, `email`, `nis`, `jenis_kelamin`, `telepon_ortu`, `password`.
  Export harus mengembalikan data akun terkini dengan urutan kolom yang sama
  dan password kosong; NIS menjadi kunci untuk memperbarui data lama.
- ⚠️ Batas dari controller yang dibagikan backend: `.xlsx`, maksimal 5 MB dan
  500 baris. Preview mengembalikan
  `{ data: [{ row, name, email, nis, jenis_kelamin, telepon_ortu, valid }],
  errors: [{ row, errors }], can_import, message }`. Import final
  mengembalikan `{ imported, message }`.

Template kosong sederhana memakai kolom `name`, `email`, `nis`,
`jenis_kelamin`, `telepon_ortu`, `password`, sesuai format yang diminta.
Backend mengonfirmasi import menggunakan NIS untuk memperbarui data lama
atau membuat akun baru bila NIS belum ada. Untuk mendukung alur edit-ekspor-
impor, import harus mengizinkan password kosong bila NIS sudah terdaftar
(password lama tidak berubah), tetapi mewajibkan password minimal 8 karakter
untuk NIS baru. Validasi email harus mengizinkan email milik akun yang sedang
diperbarui, namun tetap menolak email yang dipakai akun lain. Santri yang
tidak tercantum tidak dihapus atau dinonaktifkan. Akun santri yang baru dibuat
lewat impor harus diberi `must_change_password: true`.

## Kata sandi

Frontend mengizinkan kata sandi baru minimal 8 karakter dan menyediakan
tampilkan/sembunyikan untuk kolom kata sandi. Semua peran (termasuk santri)
yang memiliki `must_change_password: true` diarahkan ke `/ganti-password`
sebelum bisa memakai halaman lain. Akun baru buatan pimpinan dan akun santri
baru hasil impor wajib memakai flag ini agar pemilik akun mengganti kata sandi
awal saat pertama masuk. Endpoint `/auth/password` diharapkan menerima field
`current_password`, `password`, dan `password_confirmation`. Validasi minimum
password adalah 8 karakter, dan respons sukses harus membuat backend
menonaktifkan `must_change_password` untuk akun tersebut.

## Akun petugas

F-17 menyebut pimpinan membuat dan menonaktifkan akun, tetapi endpoint daftar
dan ubah status belum tercantum di kontrak. Frontend memakai:

- ⚠️ `GET /api/v1/admin/accounts` — `?q=&role=&active=` → `{ data: [...], meta }`
- `POST /api/v1/admin/accounts` — `{ name, email, password }`; backend menetapkan
  role `pengurus`, status aktif, dan `must_change_password: true` agar pemilik
  akun baru wajib mengganti kata sandi awal saat pertama masuk.
- ⚠️ `PATCH /api/v1/admin/accounts/{id}/status` — `{ active }`

Field akun: `{ id, name, email, role, is_active, must_change_password }`.
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