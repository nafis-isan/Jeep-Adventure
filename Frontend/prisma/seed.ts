import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const teams = [
    { name: 'Garuda Offroad', initials: 'GA', motto: 'Jelajah tanpa batas!' },
    { name: 'Naga Liar', initials: 'NA', motto: 'Bakar semangat, taklukkan medan.' },
    { name: 'Elang Penjelajah', initials: 'EL', motto: 'Tinggi terbang, dalam mengarungi.' },
  ];

  for (const team of teams) {
    const existing = await prisma.team.findFirst({ where: { name: team.name } });
    if (!existing) {
      await prisma.team.create({ data: { ...team } });
    }
  }

  const routeSeed = [
    { position: 1, name: 'Pos Garuda', gameType: 'Target Challenge', description: 'Titik pertama untuk mengasah ketepatan. Setiap tim melempar bantuan aman ke sasaran dengan skor berbeda.', location: 'Pos Garuda', duration: 15, difficulty: 'Mudah' },
    { position: 2, name: 'Pos Naga', gameType: 'Puzzle Race', description: 'Tim harus menyusun puzzle besar untuk membuka petunjuk rute menuju pos berikutnya.', location: 'Pos Naga', duration: 15, difficulty: 'Sedang' },
    { position: 3, name: 'Pos Elang', gameType: 'Water Transfer', description: 'Memanah? Bukan. Memindahkan air dari ember sumber ke ember tujuan menggunakan alat sederhana.', location: 'Pos Elang', duration: 12, difficulty: 'Sedang' },
    { position: 4, name: 'Pos Serigala', gameType: 'Relay Challenge', description: 'Estafet antartangga tim dengan rangkaian tantangan cepat: balap karung, bakiak, dan bawa balon.', location: 'Pos Serigala', duration: 8, difficulty: 'Sedang' },
    { position: 5, name: 'Pos Rajawali', gameType: 'Photo Mission', description: 'Misi foto: tim mencari dan berfoto di 5 spot sesuai daftar instruksi pantai.', location: 'Pos Rajawali', duration: 20, difficulty: 'Mudah' },
    { position: 6, name: 'Pos Nusantara', gameType: 'Treasure Hunt', description: 'Pos pamungkas: treasure hunt mencari clue tersembunyi yang disiapkan panitia di area perkemahan.', location: 'Pos Nusantara', duration: 25, difficulty: 'Sulit' },
  ];

  for (const route of routeSeed) {
    const existing = await prisma.route.findFirst({ where: { position: route.position } });
    if (!existing) {
      await prisma.route.create({ data: route });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
