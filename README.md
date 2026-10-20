# Sahabat Pesantren — Frontend

Ruang aman bagi santri untuk melapor perundungan dan kekerasan di lingkungan
pesantren. Karya UINIC 8.0.

Frontend web dibangun dengan React 19 + Vite. Aplikasi bisa berjalan penuh
dalam **mode mock** (tanpa backend) untuk demo, dan bisa diarahkan ke API
Laravel yang sesungguhnya lewat `VITE_API_URL`.

## Mulai

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

### Skrip

| Perintah          | Kegunaan                                    |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Jalankan server pengembangan (Vite)         |
| `npm run build`   | Bangun bundle produksi ke `dist/`           |
| `npm run preview` | Pratinjau hasil build secara lokal          |
| `npm run lint`    | Jalankan ESLint                             |

> Catatan Windows: bila `npm` tidak dikenali PowerShell, gunakan `npm.cmd`.
> Mesin dengan RAM terbatas: atur `$env:RAYON_NUM_THREADS='2'` sebelum `npm run build`.

## Konfigurasi lingkungan

Salin `.env.example` menjadi `.env` bila perlu menyesuaikan:

| Variabel                          | Default | Fungsi                                        |
| --------------------------------- | ------- | --------------------------------------------- |
| `VITE_API_URL`                    | `''`    | Origin API saja (mis. `https://api.example.com`); boleh kosong bila same-origin. |
| `VITE_USE_MOCK`                   | `true`  | `true` memakai data contoh di dalam aplikasi. |
| `VITE_IDLE_TIMEOUT_SECONDS`       | `180`   | Waktu henti otomatis akun santri (detik).     |
| `VITE_STAFF_IDLE_TIMEOUT_SECONDS` | `900`   | Waktu henti otomatis akun petugas (detik).    |

## Akun demo (mode mock)

| Peran     | ID pengguna | Kata sandi   |
| --------- | ----------- | ------------ |
| Santri    | `santri1`   | `santri123`  |
| Santri    | `santri2`   | `santri123`  |
| Pengurus  | `pengurus1` | `pengurus123`|
| Pimpinan  | `pimpinan1` | `pimpinan123`|

Akun `santri2` dan akun baru hasil impor akan diminta ganti kata sandi saat
masuk pertama kali.

## Pembaruan data santri

Pimpinan dapat mengunduh template Excel `.xlsx` dari halaman Kelola Akun,
mengisi data yang diwajibkan backend (`name`, `email`, `nis`, `jenis_kelamin`,
`telepon_ortu`), lalu melihat pratinjau dan mengimpor akun baru. Backend
membatasi ukuran unggahan hingga 5 MB. Ekspor daftar santri dan pembaruan data
santri yang sudah terdaftar belum didukung oleh kontrak API saat ini; lihat
`API_ASSUMPTIONS.md`.

## Checklist sebelum deploy produksi

- Set `VITE_USE_MOCK=false` agar data contoh tidak dipakai.
- Isi `VITE_API_URL` dengan origin API saja, misalnya
  `https://api.example.com`.
- Perbarui `connect-src` CSP di `public/_headers` dan `vercel.json` agar
  mengizinkan origin API.
- Uji login dan kirim setidaknya satu laporan melalui API online.
- Pastikan banner mode demo tidak tampil pada build produksi.

## Cara bersambung ke API asli

1. Set `VITE_USE_MOCK=false`.
2. Set `VITE_API_URL` ke origin API saja (misal `https://api.example.com`).
3. Sesuaikan CSP di `public/_headers` dan `vercel.json` — tambahkan origin API
   pada `connect-src` (lihat `API_ASSUMPTIONS.md`).
4. Bangun ulang: `npm run build`.

Kontrak endpoint yang dipakai aplikasi terdokumentasi di `API_ASSUMPTIONS.md`.

## Struktur

```
src/
  api/        # klien HTTP + service (mock/real dipilih otomatis)
  components/ # komponen bersama: ui/ (primitif) + Brand, DemoBanner, dll
  features/   # fitur: auth, reports, conversations, dashboard, accounts
  layouts/    # PublicLayout, SantriLayout, StaffLayout
  lib/        # env, konstanta domain, format tanggal, CSV, cn
  pages/      # halaman per peran (santri, staff, pimpinan) + umum
  routes/     # AppRouter (rute + proteksi peran)
```

## Keamanan & privasi

- Token disimpan di `localStorage` agar satu browser memakai satu akun dan
  sesi sinkron antar-tab (masuk/keluar di satu tab berlaku untuk semua tab).
  Token dikirim sebagai header `Authorization: Bearer`. Karena bertahan
  setelah browser ditutup, di perangkat bersama wajib memakai keluar cepat
  atau menunggu henti otomatis.
- Halaman dan respons selain aset memakai `Cache-Control: no-store, max-age=0`;
  `/assets/*` memakai cache satu tahun dengan `immutable`. `public/_headers`
  berlaku pada host yang mendukung format Netlify; pastikan host lain diberi
  aturan header yang setara. Pada Netlify, aturan `/assets/*` yang lebih
  spesifik dimaksudkan untuk menggantikan kebijakan cache umum.
- CSP membatasi koneksi ke `'self'` secara default. Tambahkan origin API ke
  `connect-src` pada `public/_headers` dan `vercel.json` sebelum memakai API
  lintas origin.
- Tidak ada `dangerouslySetInnerHTML`, atau aset eksternal. Hanya `localStorage`
  yang dipakai, itupun khusus token sesi; isi laporan/draf tidak pernah
  disimpan di browser.
- Identitas pelapor hanya terlihat petugas bila santri mengizinkan
  (`tampilkan_identitas`); UI petugas tidak pernah menampilkan NIS/nomor santri.
- Semua tanggal di UI petugas hanya menampilkan tanggal (tanpa jam).
- Keluar cepat tersedia di setiap halaman santri tanpa konfirmasi.