# 📊 TikTok Live Reporter

Sistem pencatatan dan laporan hasil siaran TikTok LIVE dengan OCR otomatis.

## ✨ Fitur

- **📸 OCR Otomatis** – Upload screenshot analisis TikTok LIVE, data terbaca secara otomatis menggunakan Tesseract.js
- **📊 Dashboard** – Ringkasan statistik total & grafik performa (tayangan, pengikut, berlian, komentar)
- **📋 Laporan Tabel** – Semua data dalam tabel yang bisa diurutkan dan dicari
- **✏️ Edit & Hapus** – Koreksi data hasil OCR sebelum/sesudah simpan
- **📥 Export CSV** – Download semua laporan dalam format CSV
- **🖼️ Preview Screenshot** – Lihat kembali screenshot yang diupload

## 🛠️ Tech Stack

| Layer     | Teknologi                                   |
|-----------|---------------------------------------------|
| Frontend  | Next.js 14 (App Router) + TypeScript        |
| Styling   | Tailwind CSS                                |
| Charts    | Recharts                                    |
| OCR       | Tesseract.js (Indo + Eng)                   |
| Backend   | Next.js API Routes (Node.js)                |
| Database  | MySQL 8+                                    |
| ORM/Query | mysql2/promise                              |

## 🚀 Cara Menjalankan

### 1. Prasyarat

- Node.js 18+
- MySQL 8+ (aktif berjalan)

### 2. Setup Database

```sql
-- Di MySQL client (DBeaver, TablePlus, atau CLI):
source /path/to/tiktok-live-reporter/database/schema.sql
```

Atau jalankan isi file `database/schema.sql` secara manual.

### 3. Seed Data Awal

```bash
# Reset database + isi user & laporan sample
npm run db:reset
npm run db:seed

# Alternatif: satu langsung reset + seed user
npm run db:fresh
```

Login default: **admin** / **password** atau **user** / **password**

> **Catatan:** `db:seed` membutuhkan tabel sudah ada. Gunakan `db:reset` dulu jika baru pertama kali, atau `db:fresh` untuk sekali jalan.

### 4. Konfigurasi Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_mysql_kamu
DB_NAME=tiktok_live_reporter
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### 7. Build untuk Production

```bash
npm run build
npm start
```

---

## 📦 Script NPM

| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Jalankan server development |
| `npm run build` | Build untuk production |
| `npm start` | Jalankan production server |
| `npm run db:reset` | Hapus database + buat ulang tabel |
| `npm run db:fresh` | Reset database + seed user |
| `npm run db:seed-users` | Isi user default (admin + user) |
| `npm run db:seed` | Isi user + 10 laporan sample |

## 📱 Cara Pakai

### Upload & Baca Screenshot

1. Buka TikTok → Profil → Creator Tools → **Analisis LIVE**
2. Pilih tab **Ikhtisar**, set rentang tanggal
3. Screenshot halaman tersebut
4. Buka aplikasi → halaman **Upload Screenshot**
5. Drop / pilih file gambar
6. Klik **Baca Screenshot** – OCR akan membaca data otomatis
7. Periksa data yang terbaca, koreksi jika perlu
8. Isi tanggal siaran, klik **Simpan Laporan**

### Dashboard

- Statistik total seluruh siaran
- Grafik tren tayangan & pengikut
- Grafik berlian & komentar
- Tabel 7 siaran terakhir

### Laporan

- Semua data siaran dalam tabel lengkap
- Sortir per kolom
- Cari berdasarkan tanggal, tayangan, dll
- Export ke CSV

---

## 📁 Struktur Folder

```
tiktok-live-reporter/
├── database/
│   └── schema.sql          # SQL setup database
├── public/
│   └── uploads/            # Screenshot yang diupload
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/     # POST – proses OCR gambar
│   │   │   ├── reports/    # GET, POST – list & tambah laporan
│   │   │   │   └── [id]/   # PUT, DELETE – edit & hapus
│   │   │   └── stats/      # GET – statistik dashboard
│   │   ├── upload/         # Halaman upload screenshot
│   │   ├── reports/        # Halaman semua laporan
│   │   ├── layout.tsx
│   │   └── page.tsx        # Dashboard utama
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── StatCard.tsx
│   │   ├── ReportTable.tsx
│   │   ├── EditModal.tsx
│   │   └── ImagePreviewModal.tsx
│   ├── lib/
│   │   ├── db.ts           # Koneksi MySQL pool
│   │   └── parseOCR.ts     # Logika OCR + parsing
│   └── types/
│       └── index.ts        # TypeScript types
├── .env.example
├── package.json
└── README.md
```

---

## 💡 Tips OCR

- Screenshot dari mode **gelap** TikTok bekerja lebih baik (kontras tinggi)
- Pastikan angka tidak terpotong di pinggir layar
- Jika OCR kurang akurat, edit manual di form sebelum simpan
- File JPEG/PNG keduanya didukung

## 🔧 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `ECONNREFUSED` | Pastikan MySQL aktif & credential di `.env` benar |
| OCR tidak terbaca | Screenshot lebih jelas / zoom in, atau edit manual |
| Port 3000 sudah dipakai | `npm run dev -- -p 3001` |
