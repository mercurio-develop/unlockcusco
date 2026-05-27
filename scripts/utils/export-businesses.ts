import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      locationSlug: true,
    },
    orderBy: {
      reviewsCount: 'desc'
    }
  });

  fs.writeFileSync('businesses-export.json', JSON.stringify(businesses, null, 2));
  console.log(`Exported ${businesses.length} businesses to businesses-export.json`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
