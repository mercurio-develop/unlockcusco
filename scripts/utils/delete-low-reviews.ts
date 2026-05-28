import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Finding businesses with less than 10 reviews...');

  // First, find them to count again for verification
  const count = await prisma.business.count({
    where: {
      reviewsCount: {
        lt: 10
      }
    }
  });

  if (count === 0) {
    console.log('✅ No businesses found with < 10 reviews.');
    return;
  }

  console.log(`⚠️ Found ${count} businesses. Deleting...`);

  // Delete businesses where reviewsCount is < 10
  const result = await prisma.business.deleteMany({
    where: {
      reviewsCount: {
        lt: 10
      }
    }
  });

  console.log(`✅ Successfully deleted ${result.count} businesses that had < 10 reviews.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
