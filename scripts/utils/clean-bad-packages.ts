import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clean() {
  await prisma.tourPackage.deleteMany({
    where: {
      OR: [
        { title: '' },
        { title: 'Trekking Package Details Not Found' },
        { basePriceUsd: 0 }
      ]
    }
  });
  console.log('Cleaned bad packages');
}

clean()
  .finally(() => prisma.$disconnect());
