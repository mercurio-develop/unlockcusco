import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany({ take: 3 });
  for (const b of businesses) {
    console.log(`Name: ${b.name}`);
    console.log(`imageUrl: ${b.imageUrl}`);
    console.log(`heroImages: ${b.heroImages}`);
    console.log('---');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
