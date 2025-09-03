# Absensi Next.js + Firebase
Aplikasi absensi sederhana dengan Next.js (App Router) + Firebase Auth & Firestore.

## Fitur
- Login/Registrasi (Email & Password)
- Absen Masuk, Absen Pulang
- Cek Hari Ini
- Rekap Mingguan & Bulanan (dengan total jam)
- Aman per-user (UID) lewat Rules

## Jalankan Lokal
```bash
pnpm i   # atau npm i / yarn
pnpm dev # atau npm run dev
```
Buka http://localhost:3000

## Konfigurasi Firebase
1. Buat project di Firebase Console.
2. Aktifkan Authentication → Email/Password.
3. Aktifkan Firestore (mode production).
4. Salin config Web App ke `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```
5. **Aturan Firestore** (Rules):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /attendance/{dateKey} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Deploy ke Vercel
- Push repo ke GitHub → Import ke Vercel
- **Build Command**: (otomatis) `next build`
- **Environment Variables**: isi semua `NEXT_PUBLIC_FIREBASE_*` di Project Settings
- Deploy 🎉

## Struktur
```
app/
  layout.tsx
  page.tsx           # login/registrasi
  dashboard/page.tsx # tombol absen & rekap
lib/
  firebase.ts
  attendance.ts
styles/globals.css
```
