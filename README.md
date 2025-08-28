# Absensi Kerja — Next.js + Vercel KV

Aplikasi absensi sederhana namun profesional. Fitur:
- Absen Masuk
- Absen Pulang
- Cek Absen (riwayat per karyawan)
- Rekap Admin (harian) dengan `ADMIN_KEY`

## Teknologi
- Next.js (App Router, Edge API Routes)
- Vercel KV (Upstash Redis) untuk penyimpanan
- TailwindCSS untuk UI

## Deploy ke Vercel (langkah cepat)
1. **Buat Project Baru**: Import repo ini ke Vercel.
2. **Aktifkan Vercel KV**: Di tab *Storage*, buat **KV Database** (Upstash Redis).
3. **Set Environment Variables** (otomatis oleh Vercel KV, pastikan ada):
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - (opsional) `KV_URL` dan `KV_REST_API_READ_ONLY_TOKEN`
   - `ADMIN_KEY` — buat sendiri string rahasia untuk akses rekap admin.
4. `npm i` lalu `npm run build` (Vercel akan otomatis).
5. Buka URL deploy. Siap dipakai 🎉

## Cara Pakai
- **Absen Masuk**: masukkan `ID Karyawan` dan `Nama`. Sistem otomatis membuat user saat absen pertama.
- **Absen Pulang**: masukkan `ID Karyawan` yang sama.
- **Cek Absen**: masukkan `ID Karyawan` untuk melihat riwayat 30 hari terakhir.
- **Admin**: masukkan `ADMIN_KEY` dan tanggal untuk melihat rekap semua karyawan di hari itu.

## Skema Data (Redis/KV)
- `attendance:{YYYY-MM-DD}:{userId}` → Hash: `{ userId, name, date, tz, checkIn, checkOut }`
- `attendance_idx:{userId}` → ZSET penyusun riwayat (score = `YYYYMMDD` sebagai angka)
- `user:{userId}` → Hash data user `{ userId, name }`
- `users` → SET berisi seluruh `userId`

## Catatan
- Waktu disimpan dalam ISO UTC, ditampilkan sesuai zona waktu browser.
- Proyek ini ditujukan untuk skala kecil–menengah. Untuk kebutuhan perusahaan besar, pertimbangkan autentikasi, lokasi GPS/IP, pembatasan perangkat, export CSV, dsb.
