import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Finding businesses with no reviews...');

  // Delete businesses where reviewsCount is 0
  const result = await prisma.business.deleteMany({
    where: {
      reviewsCount: 0
    }
  });

  console.log(`✅ Successfully deleted ${result.count} businesses that had 0 reviews.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
