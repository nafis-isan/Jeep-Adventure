# Jeep Adventure

Jeep Adventure adalah aplikasi web untuk mengelola kegiatan offroad dan team building. Fasilitator dapat mengatur tim, pos permainan, check-in, dan skor. Customer dapat melihat rute dan papan skor, lalu membagikan cerita pengalaman tim.

## Fitur

### Customer

- Melihat dashboard, daftar rute dan mini game, informasi pos, tim, serta papan skor.
- Membagikan cerita pengalaman dengan rating bintang 1-5.
- Mengunggah foto JPG, PNG, atau WEBP maksimal 5 MB.
- Melihat galeri pengalaman dan memfilter cerita yang memiliki foto.
- Setelah pengalaman berhasil disimpan, foto diunduh, caption disalin, dan Instagram dibuka. Customer mengunggah foto ke Story, menempel caption, lalu memilih akun `@jeepadventuregarut` melalui stiker Mention dan mempostingnya sendiri. Aplikasi tidak dapat menerbitkan Story atau menambahkan mention secara otomatis.

### Fasilitator

- Melihat dashboard kegiatan, tim peserta, rute, dan papan skor.
- Menambah dan menghapus tim peserta.
- Melihat informasi pos dan mengedit nama pos, jenis mini game, lokasi, tingkat kesulitan, durasi, skor maksimum, deskripsi, dan instruksi permainan.
- Melakukan check-in tim di pos.
- Menyimpan skor setelah permainan selesai dan tim sudah check-in.

### Sistem

- Login dan logout dengan session cookie HTTP-only dan JWT.
- Data disimpan di PostgreSQL menggunakan Prisma ORM.
- Validasi input API menggunakan Zod.
- Layout responsif untuk penggunaan di perangkat mobile.

## Teknologi

- Frontend: Next.js 14, React 18, TypeScript
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Autentikasi: JWT, HTTP-only cookie, bcryptjs

## Struktur Proyek

```text
Jeep adventure/
├── Backend/    # REST API Express, Prisma, migrasi, dan seed
├── Frontend/   # Aplikasi web Next.js
├── Assets/     # Asset proyek
└── README.md
```

## Prasyarat

- Node.js 18 atau lebih baru
- npm
- PostgreSQL 14 atau lebih baru

## Menjalankan Secara Lokal

### 1. Siapkan database

Buat database PostgreSQL bernama `jeep_adventure` atau gunakan nama lain dan sesuaikan `DATABASE_URL`.

```bash
createdb jeep_adventure
```

### 2. Jalankan backend

Buka terminal pertama dari root proyek:

```bash
cd Backend
npm install
```

Salin `Backend/.env.example` menjadi `Backend/.env`. Di PowerShell:

```powershell
Copy-Item .env.example .env
```

Pada macOS/Linux:

```bash
cp .env.example .env
```

Pastikan konfigurasi `Backend/.env` sesuai dengan PostgreSQL lokal:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jeep_adventure"
JWT_SECRET="ganti-dengan-secret-yang-kuat"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

Jalankan migrasi, buat Prisma Client, isi akun demo dan rute awal, lalu mulai backend:

```bash
npx prisma migrate deploy
npx prisma generate
npm run seed
npm run dev
```

Backend berjalan di `http://localhost:4000`; statusnya dapat diperiksa di `http://localhost:4000/health`.

### 3. Jalankan frontend

Buka terminal kedua dari root proyek:

```bash
cd Frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:3000`. Secara default, frontend mengakses backend di `http://localhost:4000`. Jika backend berada di alamat lain, atur `NEXT_PUBLIC_API_URL` di `Frontend/.env.local`.

## Akun Demo

Akun berikut dibuat oleh seed untuk penggunaan lokal:

| Role | Email | Password |
| Fasilitator | `fasilitator@jeep-adventure.local` | `password123` |

Buka `http://localhost:3000/login` dan masuk menggunakan salah satu akun. Kredensial ini hanya untuk pengembangan lokal; ganti sebelum aplikasi digunakan di lingkungan bersama atau production. Tidak ada form registrasi publik di aplikasi.

## Cara Menggunakan

### Alur fasilitator

1. Masuk dengan akun fasilitator.
2. Buka **Tim** untuk menambah tim peserta. Tim yang tidak digunakan dapat dihapus dari halaman yang sama.
3. Buka **Route & Games**, pilih pos, lalu tekan **Edit Pos** jika informasi atau instruksi permainan perlu diperbarui. Tekan **Simpan Perubahan** untuk menyimpan.
4. Di detail pos, tandai check-in tim yang hadir.
5. Setelah permainan selesai, pilih tim yang sudah check-in, isi skor, tambahkan catatan atau foto bukti bila diperlukan, ubah status permainan menjadi selesai, lalu simpan skor.
6. Buka **Papan Skor** untuk melihat peringkat berdasarkan total poin.

### Alur customer

1. Masuk dengan akun customer.
2. Gunakan **Route & Games** untuk melihat detail pos dan mini game, atau buka **Papan Skor** untuk melihat peringkat.
3. Buka **Bagikan Pengalaman**, pilih rute dan tim, beri rating, lalu tulis cerita. Foto bersifat opsional; format yang didukung JPG, PNG, dan WEBP dengan ukuran maksimal 5 MB.
4. Tekan **Kirim Pengalaman**. Setelah tersimpan, foto yang dipilih akan diunduh, caption disalin, dan Instagram dibuka.
5. Di Instagram, buat Story, unggah foto yang diunduh, tempel caption, lalu tambahkan stiker **Mention** dan pilih `@jeepadventuregarut` agar mention tertaut. Terbitkan Story secara manual. Tombol **Salin @jeepadventuregarut** juga tersedia di halaman pengalaman.
6. Cerita yang tersimpan tampil di galeri pengalaman dalam aplikasi.

## Endpoint API Backend

Endpoint berikut disediakan oleh backend. Endpoint bisnis memerlukan autentikasi, kecuali health check dan login.

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| `GET` | `/health` | Memeriksa status backend |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Mengambil sesi pengguna aktif |
| `POST` | `/api/auth/logout` | Logout |
| `POST` | `/api/auth/accounts` | Membuat akun; hanya fasilitator |
| `GET`, `POST`, `PATCH`, `DELETE` | `/api/teams`, `/api/teams/:id` | Melihat dan mengelola tim |
| `GET`, `POST`, `PATCH`, `DELETE` | `/api/routes`, `/api/routes/:id` | Melihat dan mengelola rute |
| `GET`, `POST` | `/api/checkins` | Melihat atau membuat check-in; gunakan `DELETE` untuk membatalkan |
| `GET`, `POST` | `/api/scores` | Melihat dan menyimpan skor |
| `GET` | `/api/leaderboard` | Melihat peringkat tim |
| `GET`, `POST` | `/api/experiences` | Melihat dan menyimpan pengalaman |

## Perintah Pengembangan

Jalankan dari direktori masing-masing aplikasi.

Backend:

```bash
npm run dev      # server development dengan watch mode
npm run build    # compile TypeScript
npm start        # jalankan hasil build
npm run seed     # isi akun demo dan rute awal
```

Frontend:

```bash
npm run dev      # server development Next.js
npm run build    # build production
npm start        # jalankan hasil build
```

## Keamanan

- Jangan commit `Backend/.env` atau file environment yang berisi kredensial.
- Ganti `JWT_SECRET` dengan nilai rahasia yang kuat sebelum deployment.
- Jangan gunakan akun demo atau password `password123` di production.
