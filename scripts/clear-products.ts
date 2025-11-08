import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  console.log('[clear] Deleting transactions...');
  const tr = await prisma.transaction.deleteMany({});
  console.log(`[clear] Deleted ${tr.count} transactions`);

  console.log('[clear] Deleting products...');
  const pr = await prisma.product.deleteMany({});
  console.log(`[clear] Deleted ${pr.count} products`);

  await prisma.$disconnect();
  console.log('[clear] Done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
