import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  await prisma.$queryRaw`SELECT 1`;
  console.log('DB OK');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('DB ERROR', e?.message || e);
  process.exit(1);
});
