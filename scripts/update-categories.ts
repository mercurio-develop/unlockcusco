import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting category updates...");

  // Update 'ATTRACTION' to 'culture'
  const attractionResult = await prisma.business.updateMany({
    where: {
      category: {
        in: ['ATTRACTION', 'attraction', 'Attraction']
      }
    },
    data: {
      category: 'culture'
    }
  });
  console.log(`Updated ${attractionResult.count} ATTRACTION businesses to culture.`);

  // Lowercase all categories
  await prisma.$executeRawUnsafe(`UPDATE "Business" SET category = LOWER(category);`);
  
  console.log(`Lowercased all business categories.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
