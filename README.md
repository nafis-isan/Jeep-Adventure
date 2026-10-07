# Jeep Adventure

Jeep Adventure membantu mengelola kegiatan offroad dan team building: rute permainan, check-in, skor, dan cerita peserta. Laravel melayani website dan API dari root repositori. Satu source React Native/Expo di `mobile/` dapat dibangun untuk Android/iOS atau React Native Web. Laravel menyajikan hasil build web dari `public/mobile`, dan website, aplikasi mobile, serta API menggunakan database MySQL yang sama.

## Fitur

- Login customer dan fasilitator dengan hak akses berbasis peran.
- Dashboard, deskripsi rute dan permainan, instruksi pos, serta fitur edit rute untuk fasilitator.
- Pendaftaran tim, persetujuan fasilitator, pembuatan akun peserta, dan daftar anggota tim.
- Check-in tim dan pencatatan satu skor selesai per tim dan rute.
- Unggah bukti skor, papan skor, dan riwayat skor.
- Cerita peserta dengan rating 1–5, foto JPG/PNG/WEBP opsional maksimal 5 MB, serta galeri yang dapat difilter.
- Aplikasi React Native/Expo yang sama dapat dijalankan sebagai aplikasi Android/iOS dan React Native Web.
- Laravel menyajikan versi browser aplikasi React Native pada `/mobile`, tanpa server Next.js atau Node.js terpisah.
- Sesi web memakai cookie sesi Laravel HTTP-only; token mobile memakai Laravel Sanctum dan disimpan di secure storage perangkat.

Fitur berbagi Instagram menyiapkan foto dan caption untuk diposting sendiri oleh pengguna. Instagram tidak mengizinkan aplikasi ini menerbitkan Story atau memasang stiker Mention secara otomatis; langkah tersebut tetap dilakukan pengguna di Instagram.

## Teknologi

- Web dan backend: Laravel 12, PHP 8.2+
- Aplikasi mobile: React Native, Expo, TypeScript
- Database: MySQL 8+
- Autentikasi mobile: Laravel Sanctum
- Penyimpanan foto: Laravel public storage

## Struktur proyek

```text
Jeep Adventure/
├── app/, routes/, resources/, database/ # Aplikasi web/API Laravel
├── public/                             # Aset website dan hasil build React Native Web
├── mobile/                             # Source React Native bersama dan konfigurasi Expo
└── README.md
```

## Prasyarat

- PHP 8.2 atau lebih baru dengan ekstensi PDO MySQL, Fileinfo, GD, mbstring, OpenSSL, dan XML
- Composer
- MySQL 8 atau lebih baru
- Node.js 20 atau lebih baru dan npm
- Expo Go untuk uji coba perangkat, atau lingkungan native Android/iOS

## Menjalankan aplikasi Laravel

Buat database MySQL baru:

```sql
CREATE DATABASE jeep_adventure CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Dari PowerShell, jalankan perintah di root repositori:

```powershell
Copy-Item .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Sebelum menjalankan migrasi, sesuaikan `.env` jika host, nama database, username, atau password MySQL berbeda dari contoh. Aplikasi web tersedia di `http://localhost:8000`.

Seeder membuat akun lokal untuk pengembangan:

| Peran | Email | Password |
| --- | --- | --- |
| Customer | `customer@jeep-adventure.local` | `password123` |
| Fasilitator | `fasilitator@jeep-adventure.local` | `password123` |

Ganti kredensial tersebut sebelum memakai lingkungan bersama atau production. Seeder juga menambahkan enam rute permainan awal. Foto disimpan di `storage/app/public`; perintah `php artisan storage:link` membuatnya tersedia untuk web dan aplikasi mobile. Artwork proyek berada di `public/Assets/images`.

## Menjalankan React Native Web

Source React Native, konfigurasi Expo, dan dependency berada di `mobile/`. Instal dependency, build bundle web ke public Laravel, lalu buka `/mobile`:

```powershell
cd mobile
npm install
npm run build:web
```

Kembali ke root repositori dan jalankan server Laravel seperti langkah di atas, lalu buka `http://localhost:8000/mobile`. Route Laravel melayani shell React Native Web, sedangkan aset statis dibaca dari `public/mobile`. Setelah source mobile berubah, ulangi `npm run build:web`.

Untuk pengembangan interaktif dengan Fast Refresh, jalankan Expo Web secara lokal:

```powershell
cd mobile
npm run web
```

Karena Expo Web dan Laravel berjalan pada port berbeda selama pengembangan, arahkan API ke Laravel sebelum menjalankan Expo (contoh PowerShell):

```powershell
$env:EXPO_PUBLIC_API_URL = "http://localhost:8000/api"
npm run web
```

## Menjalankan aplikasi Android/iOS

Source React Native yang sama dapat dijalankan sebagai aplikasi native:

```powershell
cd mobile
$env:EXPO_PUBLIC_API_URL = "http://10.0.2.2:8000/api" # emulator Android
npm run android
# atau npm run ios pada macOS
```

Atur `EXPO_PUBLIC_API_URL` sebagai environment variable build Expo ke alamat API Laravel yang dapat dijangkau perangkat:

- Emulator Android: `http://10.0.2.2:8000/api`
- Simulator iOS: `http://localhost:8000/api`
- Perangkat fisik: `http://<IP-LAN-komputer>:8000/api`

Untuk perangkat fisik, jalankan Laravel dari root repositori dengan `php artisan serve --host=0.0.0.0 --port=8000`, atur `APP_URL` di `.env` ke IP LAN yang sama, dan pastikan komputer serta perangkat berada di jaringan yang sama. Izinkan koneksi melalui firewall komputer.

## Konfigurasi domain production

Konfigurasi lama memisahkan website di `https://jag.linqkeun.com` dan API di `https://api.jag.linqkeun.com`. Laravel kini melayani website dan API dari satu aplikasi. Atur `APP_URL=https://jag.linqkeun.com` dan `APP_ENV=production`, pastikan `APP_DEBUG=false`, lalu arahkan kedua domain ke deployment Laravel yang sama jika domain API lama tetap digunakan. Untuk build Android/iOS production, atur `EXPO_PUBLIC_API_URL=https://api.jag.linqkeun.com/api`. React Native Web yang dilayani Laravel tetap menggunakan `/api` dari origin yang sama.

## Endpoint JSON untuk mobile

Selain `GET /health` dan `POST /api/auth/login`, endpoint di bawah memerlukan header `Authorization: Bearer <token>` dan `Accept: application/json`. Login menghasilkan token Sanctum.

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| `GET` | `/health` | Memeriksa ketersediaan Laravel |
| `POST` | `/api/auth/login` | Login dan membuat token mobile |
| `GET` | `/api/auth/me` | Mengambil pengguna aktif |
| `POST` | `/api/auth/logout` | Mencabut token aktif |
| `POST` | `/api/auth/accounts` | Membuat akun (khusus fasilitator) |
| `GET`, `POST` | `/api/teams` | Melihat atau mendaftarkan tim |
| `PATCH`, `DELETE` | `/api/teams/{team}` | Mengubah status atau menghapus tim (khusus fasilitator) |
| `GET`, `POST` | `/api/routes` | Melihat atau menambahkan rute |
| `GET`, `PATCH`, `DELETE` | `/api/routes/{route}` | Melihat, mengubah, atau menghapus rute |
| `GET`, `POST`, `DELETE` | `/api/checkins` | Melihat, mencatat, atau membatalkan check-in |
| `GET`, `POST` | `/api/scores` | Melihat skor atau menyimpan hasil permainan |
| `GET` | `/api/leaderboard` | Melihat peringkat tim |
| `GET`, `POST` | `/api/experiences` | Melihat dan mengirim cerita peserta |

Hak akses fasilitator tetap divalidasi di server. ID tim dan rute menggunakan UUID. Foto dapat dikirim sebagai file multipart atau base64 melalui `photo_data` dengan `photo_type` (`image/jpeg`, `image/png`, atau `image/webp`).

## Pengujian

Buat database MySQL terpisah untuk pengujian:

```sql
CREATE DATABASE jeep_adventure_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Suite pengujian memakai database `jeep_adventure_test` agar tidak menghapus database pengembangan:

```powershell
php artisan test
```

Periksa tipe dan build web aplikasi React Native:

```powershell
cd mobile
npx tsc --noEmit
npm run build:web
```

## Migrasi data

Rewrite ini memakai database MySQL baru. Data PostgreSQL/Prisma yang lama tidak dimigrasikan; aplikasi Node.js, Next.js, dan Prisma sebelumnya telah digantikan.

## Catatan keamanan

- Jangan commit file `.env` atau kredensial production.
- Gunakan `APP_KEY` yang kuat dan HTTPS di production.
- Jangan gunakan akun demo untuk production.
- Gunakan media penyimpanan persisten yang sesuai untuk foto production.
