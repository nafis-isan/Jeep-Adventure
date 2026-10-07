# Jeep Adventure

Aplikasi untuk mengelola kegiatan offroad dan team building Jeep Adventure. Laravel melayani website, API, autentikasi, serta penyimpanan data MySQL. Website menggunakan desain responsif dan bisa dibuka langsung melalui Chrome di komputer maupun ponsel—tidak perlu memasang aplikasi mobile untuk menggunakannya melalui browser.

Source React Native/Expo tersedia di `mobile/` untuk pengembangan aplikasi native Android/iOS.

## Fitur

- Login customer dan fasilitator dengan hak akses berbeda.
- Dashboard petualangan, daftar rute dan permainan, instruksi pos, serta pengelolaan rute untuk fasilitator.
- Pendaftaran tim oleh customer dan persetujuan status oleh fasilitator.
- Pengelolaan tim dan akun peserta oleh fasilitator, termasuk pilihan warna identitas tim.
- Check-in tim pada setiap pos.
- Pencatatan skor, catatan, dan foto bukti permainan oleh fasilitator.
- Papan skor dan riwayat hasil permainan.
- Cerita pengalaman dengan rating dan foto, termasuk galeri peserta.
- Tampilan website responsif untuk layar ponsel.
- API Laravel Sanctum yang dapat digunakan source React Native.

## Teknologi

- PHP 8.2+ dan Laravel 12
- MySQL 8+ (atau SQLite untuk pengembangan lokal)
- Composer
- Node.js 20+ dan npm untuk source React Native/Expo
- React Native, Expo, dan TypeScript di `mobile/`

## Struktur proyek

```text
Jeep Adventure/
├── app/                 # Controller, model, middleware
├── bootstrap/           # Bootstrap Laravel
├── config/              # Konfigurasi aplikasi dan database
├── database/            # Migration, factory, dan seeder
├── mobile/              # Source React Native/Expo untuk Android/iOS
├── public/              # Entry point, CSS, artwork, dan file publik
├── resources/views/     # Halaman website Laravel
├── routes/              # Route web dan API
├── storage/             # Log, cache, dan file unggahan
├── tests/               # Pengujian Laravel
├── .env.example         # Contoh konfigurasi lokal
└── README.md
```

## Menjalankan secara lokal

### 1. Siapkan database

Buat database MySQL baru:

```sql
CREATE DATABASE jeep_adventure CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Pasang dependensi dan konfigurasi Laravel

Jalankan perintah dari root repositori di PowerShell:

```powershell
Copy-Item .env.example .env
composer install
php artisan key:generate
```

Edit `.env` dan tetapkan koneksi MySQL:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=jeep_adventure
DB_USERNAME=root
DB_PASSWORD=
```

Gunakan username dan password MySQL lokal Anda. Jalankan migrasi, data awal, tautan file publik, lalu server:

```powershell
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Buka [http://localhost:8000](http://localhost:8000). Untuk memakai website di ponsel, buka alamat server dari Chrome di ponsel; perangkat dan komputer harus dapat saling menjangkau melalui jaringan. Jalankan server dengan `php artisan serve --host=0.0.0.0 --port=8000`, atur `APP_URL` di `.env` ke alamat IP LAN komputer, dan izinkan koneksi melalui firewall.

### Menggunakan SQLite

Untuk pengembangan lokal tanpa MySQL, buat file database dan atur `.env`:

```powershell
New-Item -ItemType File -Path database\database.sqlite -Force
```

```dotenv
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

Kemudian jalankan:

```powershell
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

## Akun demo lokal

Seeder membuat akun berikut:

| Peran | Email | Password |
| --- | --- | --- |
| Customer | `customer@jeep-adventure.local` | `password123` |
| Fasilitator | `fasilitator@jeep-adventure.local` | `jeepadventurehebat` |

Kredensial ini hanya untuk lingkungan lokal. Ganti password dan jangan gunakan akun demo di production. Menjalankan ulang `php artisan db:seed` akan menyelaraskan kembali akun demo dengan password pada seeder.

## Foto dan file publik

Foto pengalaman dan bukti skor disimpan pada disk Laravel `public`, di bawah `storage/app/public`. Jalankan `php artisan storage:link` agar dapat dibaca browser melalui `public/storage`. File foto yang diterima harus berupa JPG, PNG, atau WEBP dan berukuran maksimal 5 MB.

Artwork aplikasi berada di `public/Assets/images`.

## Aplikasi React Native

Source Expo di `mobile/` adalah untuk pengembangan atau build aplikasi Android/iOS. Website yang dibuka di Chrome ponsel tetap memakai website Laravel responsif; tidak perlu membuka `/mobile` atau membangun bundle React Native Web untuk pengalaman tersebut.

Pasang dependency dan mulai Expo:

```powershell
Set-Location mobile
npm install
```

Atur URL API Laravel yang dapat dijangkau perangkat sebelum menjalankan aplikasi:

```powershell
$env:EXPO_PUBLIC_API_URL = "http://10.0.2.2:8000/api" # Emulator Android
npm run android
```

Gunakan URL yang sesuai untuk target:

- Emulator Android: `http://10.0.2.2:8000/api`
- Simulator iOS: `http://localhost:8000/api`
- Perangkat fisik: `http://<IP-LAN-komputer>:8000/api`

Perintah `npm run ios` tersedia untuk macOS yang sudah memiliki toolchain iOS.

## API

Endpoint API menggunakan prefix `/api`. Login menerima email dan password lalu mengembalikan token Sanctum. Untuk endpoint terlindungi, kirim header:

```http
Accept: application/json
Authorization: Bearer <token>
```

| Method | Endpoint | Akses / fungsi |
| --- | --- | --- |
| `GET` | `/health` | Status server |
| `POST` | `/api/auth/login` | Login dan memperoleh token |
| `GET` | `/api/auth/me` | Pengguna aktif |
| `POST` | `/api/auth/logout` | Logout dan mencabut token |
| `POST` | `/api/auth/accounts` | Membuat akun; fasilitator |
| `GET`, `POST` | `/api/teams` | Melihat atau mendaftarkan tim |
| `PATCH`, `DELETE` | `/api/teams/{team}` | Mengelola tim; fasilitator |
| `GET`, `POST` | `/api/routes` | Melihat atau menambahkan rute |
| `GET`, `PATCH`, `DELETE` | `/api/routes/{route}` | Melihat atau mengelola rute |
| `GET`, `POST`, `DELETE` | `/api/checkins` | Melihat, mencatat, atau membatalkan check-in |
| `GET`, `POST` | `/api/scores` | Melihat atau menyimpan skor |
| `GET` | `/api/leaderboard` | Papan skor |
| `GET`, `POST` | `/api/experiences` | Melihat atau mengirim cerita pengalaman |

Endpoint selain login dan health memerlukan autentikasi Sanctum. Perubahan rute, pembuatan akun, persetujuan/penghapusan tim, check-in, dan penyimpanan skor dibatasi untuk fasilitator sesuai endpoint. Foto API dapat dikirim sebagai file multipart atau sebagai `photo_data` base64 dengan `photo_type`.

## Pengujian

Pengujian PHPUnit memakai database `jeep_adventure_test` agar tidak menghapus database pengembangan. Buat database pengujian MySQL terpisah sebelum menjalankan:

```sql
CREATE DATABASE jeep_adventure_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```powershell
php artisan test
```

Periksa source React Native:

```powershell
Set-Location mobile
npx tsc --noEmit
```

## Deployment

- Atur `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`, `APP_KEY`, kredensial MySQL, dan HTTPS di server.
- Arahkan document root web server ke direktori `public/`.
- Pastikan `storage/` dan `bootstrap/cache/` dapat ditulis oleh pengguna proses PHP.
- Jalankan `php artisan migrate --force` saat deployment dan `php artisan storage:link` jika tautan storage belum tersedia.
- Domain lama `jag.linqkeun.com` dapat digunakan untuk website. Jika `api.jag.linqkeun.com` masih dipakai oleh build native, arahkan domain tersebut ke deployment Laravel yang sama dan atur `EXPO_PUBLIC_API_URL=https://api.jag.linqkeun.com/api` saat membangun aplikasi native.
- Jangan commit `.env`, token, atau kredensial production.

## Migrasi dari aplikasi lama

Implementasi saat ini menggunakan database Laravel baru. Data lama dari PostgreSQL/Prisma tidak otomatis dipindahkan; backup dan migrasi data harus dilakukan terpisah jika data tersebut perlu dipertahankan.
