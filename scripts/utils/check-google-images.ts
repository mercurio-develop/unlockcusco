import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const allBusinesses = await prisma.business.findMany({
    select: { id: true, name: true, imageUrl: true }
  });

  let googleImages = 0;
  let otherImages = 0;

  for (const b of allBusinesses) {
    if (b.imageUrl?.includes('googleusercontent.com')) {
      googleImages++;
    } else if (b.imageUrl) {
      otherImages++;
    }
  }

  console.log(`Google Images: ${googleImages}`);
  console.log(`Other Images: ${otherImages}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
