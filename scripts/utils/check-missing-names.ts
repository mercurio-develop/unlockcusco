import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const missing = await prisma.business.findMany({
    where: {
      description: ""
    },
    include: { reviews: true }
  });

  console.log(`Total missing: ${missing.length}`);
  missing.forEach(b => {
      console.log(`- ${b.name} (${b.category}) - Reviews: ${b.reviews.length}`);
  });
}
main().finally(() => prisma.$disconnect());
