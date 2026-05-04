import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const emptyImages = await prisma.business.count({
    where: { imageUrl: '' }
  });
  console.log(`Businesses with empty imageUrl: ${emptyImages}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
