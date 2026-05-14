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

---

## 🌐 Deploy ke VPS (Production)

Panduan deploy untuk domain **livetiktok.mendunia.id** dari repository GitHub.

### 1. Prasyarat VPS

- Ubuntu 20.04 / 22.04 / 24.04
- Node.js 18+
- MySQL 8+
- Nginx
- PM2 (global)
- Domain livetiktok.mendunia.id pointing ke IP VPS

### 2. Clone Repository

```bash
cd /var/www
sudo mkdir -p livetiktok.mendunia.id
sudo chown $USER:$USER livetiktok.mendunia.id
git clone https://github.com/RIANPURNAMA1/TIKTOK-LIVE-REPORTS.git livetiktok.mendunia.id
cd livetiktok.mendunia.id
```

### 4. Setup Database

```bash
# Login ke MySQL
sudo mysql -u root -p

# Buat database
CREATE DATABASE IF NOT EXISTS tiktok_live_reporter CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Buat user database (opsional, atau pakai root)
CREATE USER 'tiktok_user'@'localhost' IDENTIFIED BY 'passwordkuat123';
GRANT ALL PRIVILEGES ON tiktok_live_reporter.* TO 'tiktok_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u tiktok_user -p tiktok_live_reporter < database/schema.sql

# Seed data awal
npm install
npm run db:seed
```

### 5. Konfigurasi Environment

```bash
cp .env.example .env
nano .env
```

Isi `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=tiktok_user
DB_PASSWORD=password_kuat
DB_NAME=tiktok_live_reporter

NEXT_PUBLIC_APP_URL=https://livetiktok.mendunia.id
JWT_SECRET=isi_dengan_string_acak_yang_aman
GROQ_API_KEY=groq_api_key_kamu
```

### 6. Build & Jalankan dengan PM2

```bash
# Install dependencies
npm install

# Build untuk production
npm run build

# Jalankan dengan PM2
pm2 start npm --name "tiktok-live" -- start
pm2 save
pm2 startup

# Set PM2 restart otomatis saat reboot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

### 7. Konfigurasi Nginx (Reverse Proxy)

```bash
sudo nano /etc/nginx/sites-available/livetiktok.mendunia.id
```

Isi file konfigurasi:

```nginx
server {
    listen 80;
    server_name livetiktok.mendunia.id;

    # Redirect HTTP → HTTPS (pakai Certbot nanti)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name livetiktok.mendunia.id;

    # SSL — isi setelah Certbot
    ssl_certificate /etc/letsencrypt/live/livetiktok.mendunia.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/livetiktok.mendunia.id/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Upload size (max 10MB untuk screenshot)
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache file statis
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        access_log off;
    }

    location /uploads {
        alias /var/www/livetiktok.mendunia.id/public/uploads;
        expires 30d;
        access_log off;
    }
}
```

Aktifkan site:

```bash
sudo ln -s /etc/nginx/sites-available/livetiktok.mendunia.id /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. SSL dengan Certbot (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d livetiktok.mendunia.id

# Auto-renewal (biasanya sudah otomatis)
sudo certbot renew --dry-run
```

### 9. Verifikasi

- Buka https://livetiktok.mendunia.id
- Login dengan **admin** / **password**
- Pastikan upload screenshot & OCR berfungsi

### 10. Update Aplikasi

```bash
cd /var/www/livetiktok.mendunia.id
git pull origin main
npm install
npm run build
pm2 restart tiktok-live
```

### Perintah PM2 Penting

| Perintah | Deskripsi |
|----------|-----------|
| `pm2 status` | Lihat status semua process |
| `pm2 logs tiktok-live` | Lihat log aplikasi |
| `pm2 restart tiktok-live` | Restart aplikasi |
| `pm2 stop tiktok-live` | Stop aplikasi |
| `pm2 monit` | Monitor CPU & memory |
