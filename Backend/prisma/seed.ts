import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'customer@jeep-adventure.local' },
    update: { name: 'Customer Jeep Adventure', passwordHash, role: UserRole.CUSTOMER },
    create: {
      name: 'Customer Jeep Adventure',
      email: 'customer@jeep-adventure.local',
      passwordHash,
      role: UserRole.CUSTOMER,
    },
  });

  await prisma.user.upsert({
    where: { email: 'fasilitator@jeep-adventure.local' },
    update: { name: 'Fasilitator Jeep Adventure', passwordHash, role: UserRole.FACILITATOR },
    create: {
      name: 'Fasilitator Jeep Adventure',
      email: 'fasilitator@jeep-adventure.local',
      passwordHash,
      role: UserRole.FACILITATOR,
    },
  });

  const routes = [
    { position: 1, name: 'Pos Garuda', gameType: 'Target Challenge', description: 'Titik pertama untuk mengasah ketepatan.', location: 'Pos Garuda', duration: 15, difficulty: 'Mudah' },
    { position: 2, name: 'Pos Naga', gameType: 'Puzzle Race', description: 'Tim harus menyusun puzzle besar.', location: 'Pos Naga', duration: 15, difficulty: 'Sedang' },
    { position: 3, name: 'Pos Elang', gameType: 'Water Transfer', description: 'Memindahkan air menggunakan alat sederhana.', location: 'Pos Elang', duration: 12, difficulty: 'Sedang' },
    { position: 4, name: 'Pos Serigala', gameType: 'Relay Challenge', description: 'Estafet dengan rangkaian tantangan cepat.', location: 'Pos Serigala', duration: 8, difficulty: 'Sedang' },
    { position: 5, name: 'Pos Rajawali', gameType: 'Photo Mission', description: 'Misi foto di beberapa spot.', location: 'Pos Rajawali', duration: 20, difficulty: 'Mudah' },
    { position: 6, name: 'Pos Nusantara', gameType: 'Treasure Hunt', description: 'Mencari petunjuk hingga harta karun terakhir.', location: 'Pos Nusantara', duration: 25, difficulty: 'Sulit' },
  ];

  for (const route of routes) {
    const existing = await prisma.route.findFirst({ where: { position: route.position } });
    if (!existing) await prisma.route.create({ data: route });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });