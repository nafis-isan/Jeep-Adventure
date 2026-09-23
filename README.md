# Jeep Adventure

Jeep Adventure adalah aplikasi web untuk mengelola aktivitas adventure berbasis tim, rute permainan, pencatatan skor, dan leaderboard.

## Fitur

- Registrasi, login, pengecekan sesi, dan logout pengguna.
- Autentikasi berbasis cookie dengan JWT.
- Dashboard aplikasi untuk melihat aktivitas adventure.
- Pengelolaan tim: melihat, menambahkan, dan menghapus tim.
- Pengelolaan rute adventure dengan posisi, jenis permainan, lokasi, durasi, dan tingkat kesulitan.
- Pencatatan skor tim pada setiap rute.
- Penandaan status penyelesaian rute.
- Leaderboard berdasarkan total poin setiap tim.
- Validasi data request menggunakan Zod.
- Penyimpanan data menggunakan PostgreSQL dan Prisma ORM.

## Teknologi

- Frontend: Next.js, React, TypeScript, Axios
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JWT, HTTP-only cookie, bcryptjs

## Struktur Proyek

```text
Jeep adventure/
├── Backend/    # REST API Express dan Prisma
├── Frontend/   # Aplikasi web Next.js
├── Assets/     # Asset proyek
└── README.md
```

## Prasyarat

Pastikan perangkat sudah memiliki:

- Node.js 18 atau lebih baru
- npm
- PostgreSQL 14 atau lebih baru
- Git

## Menjalankan Setelah Git Clone

### 1. Clone repository

```bash
git clone <URL-REPOSITORY>
cd "Jeep adventure"
```

Ganti `<URL-REPOSITORY>` dengan URL repository Git yang sebenarnya.

### 2. Siapkan database PostgreSQL

Buat database bernama `jeep_adventure`, atau gunakan nama database lain yang sesuai.

Contoh menggunakan PostgreSQL CLI:

```bash
createdb jeep_adventure
```

### 3. Siapkan Backend

Buka terminal pertama:

```bash
cd Backend
npm install
copy .env.example .env
```

Pada macOS/Linux, gunakan perintah berikut untuk menyalin environment file:

```bash
cp .env.example .env
```

Buka `Backend/.env`, lalu sesuaikan nilainya:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jeep_adventure"
JWT_SECRET="ganti-dengan-secret-yang-kuat"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

Jalankan migrasi database dan generate Prisma Client:

```bash
npx prisma migrate deploy
npx prisma generate
```

Jika ingin mengisi data awal yang tersedia di project:

```bash
npx prisma db seed
```

Jalankan backend dalam mode development:

```bash
npm run dev
```

Backend tersedia di `http://localhost:4000`.

### 4. Siapkan Frontend

Buka terminal kedua dari folder root proyek:

```bash
cd Frontend
npm install
npm run dev
```

Frontend tersedia di `http://localhost:3000`.

## Perintah Penting

### Backend

```bash
npm run dev      # development dengan watch mode
npm run build    # compile TypeScript ke dist
npm start        # jalankan hasil build
```

### Frontend

```bash
npm run dev      # development server Next.js
npm run build    # build production
npm start        # jalankan production server
```

## Endpoint Utama

Semua endpoint API selain health check memerlukan autentikasi.

- `GET /health` - memeriksa status backend
- `POST /api/auth/register` - registrasi pengguna
- `POST /api/auth/login` - login pengguna
- `GET /api/auth/me` - mengambil sesi pengguna aktif
- `POST /api/auth/logout` - logout pengguna
- `GET|POST /api/teams` - melihat dan menambahkan tim
- `DELETE /api/teams/:id` - menghapus tim
- `GET|POST /api/routes` - melihat dan menambahkan rute
- `GET|POST /api/scores` - melihat dan menambahkan skor
- `GET /api/leaderboard` - melihat peringkat tim

## Catatan Keamanan

- Jangan commit file `Backend/.env` atau file environment lain yang berisi password dan secret.
- Gunakan `Backend/.env.example` sebagai template konfigurasi.
- Ganti `JWT_SECRET` dengan nilai rahasia yang kuat sebelum deployment.
