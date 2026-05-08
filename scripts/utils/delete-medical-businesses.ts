import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Finding medical businesses...');

  // Delete businesses where category is 'MEDICAL'
  const result = await prisma.business.deleteMany({
    where: {
      category: 'MEDICAL'
    }
  });

  console.log(`✅ Successfully deleted ${result.count} medical businesses.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
