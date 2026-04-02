import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL ?? 'admin@wasel.local';
  const plain = process.env.ADMIN_SEED_PASSWORD ?? 'ChangeMeAdmin123!';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Seed skip: user already exists', email);
    return;
  }

  const password = await bcrypt.hash(plain, 10);
  await prisma.user.create({
    data: {
      email,
      password,
      firstName: 'Admin',
      lastName: 'Wasel',
      role: 'ADMIN',
    },
  });

  console.log('Seeded ADMIN user:', email);
  console.log('(Change ADMIN_SEED_PASSWORD in .env before first run in production.)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
