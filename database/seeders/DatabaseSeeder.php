<?php

namespace Database\Seeders;

use App\Models\AdventureRoute;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'customer@jeep-adventure.local'],
            [
                'name' => 'Customer Jeep Adventure',
                'password' => Hash::make('password123'),
                'role' => 'CUSTOMER',
            ],
        );
        User::updateOrCreate(
            ['email' => 'fasilitator@jeep-adventure.local'],
            [
                'name' => 'Fasilitator Jeep Adventure',
                'password' => Hash::make('password123'),
                'role' => 'FACILITATOR',
            ],
        );

        $routes = [
            [1, 'Pos Garuda', 'Target Challenge', 'Titik pertama untuk mengasah ketepatan.', 'Setiap anggota melempar lima bola ringan ke sasaran bertingkat. Jarak lempar aman 5 meter.', 'Bukit Pasir', 10, 100, 'Mudah', '#e56a00'],
            [2, 'Pos Naga', 'Puzzle Race', 'Tim menyusun puzzle besar untuk membuka petunjuk rute berikutnya.', 'Susun semua keping peta. Bantuan panitia mengurangi 10 poin. Waktu maksimal 15 menit.', 'Hutan Bambu', 15, 100, 'Sedang', '#2563eb'],
            [3, 'Pos Elang', 'Water Transfer', 'Pindahkan air dari ember sumber ke ember tujuan menggunakan alat sederhana.', 'Gunakan spons untuk memindahkan air sejauh 8 meter selama 12 menit. Tidak boleh berlari.', 'Sungai Kering', 12, 100, 'Sedang', '#0f9bb4'],
            [4, 'Pos Serigala', 'Relay Challenge', 'Estafet antaranggota tim dengan rangkaian tantangan cepat.', 'Selesaikan tantangan estafet bersama dengan aman dan bergantian. Skor berdasarkan waktu.', 'Lapangan Terbuka', 8, 100, 'Sedang', '#16a34a'],
            [5, 'Pos Rajawali', 'Photo Mission', 'Misi foto di beberapa spot sesuai instruksi panitia.', 'Temukan lima spot sesuai daftar, lalu ambil foto bersama tim sebagai bukti misi.', 'Bukit Panorama', 20, 100, 'Mudah', '#9333ea'],
            [6, 'Pos Nusantara', 'Treasure Hunt', 'Pos pamungkas: temukan petunjuk tersembunyi di area perkemahan.', 'Temukan lima kartu petunjuk dan pecahkan teka-teki terakhir untuk menemukan harta karun.', 'Area Perkemahan', 25, 120, 'Sulit', '#d99100'],
        ];

        foreach ($routes as [$position, $name, $gameType, $description, $instruction, $location, $duration, $maxPoints, $difficulty, $color]) {
            AdventureRoute::updateOrCreate(
                ['position' => $position],
                compact('name', 'description', 'location', 'duration', 'difficulty', 'color')
                    + ['game_type' => $gameType, 'instruction' => $instruction, 'max_points' => $maxPoints],
            );
        }
    }
}
