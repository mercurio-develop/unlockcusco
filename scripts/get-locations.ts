import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const locations = await prisma.business.findMany({
    select: { locationSlug: true },
    distinct: ['locationSlug']
  });
  console.log(locations.map(l => l.locationSlug).filter(Boolean));
}

main().catch(console.error).finally(() => prisma.$disconnect());
