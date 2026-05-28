import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const allBusinesses = await prisma.business.findMany({
    select: { name: true, imageUrl: true }
  });

  let withImage = 0;
  let withoutImage = 0;
  let dummyImage = 0;

  for (const b of allBusinesses) {
    if (!b.imageUrl) {
      withoutImage++;
    } else if (b.imageUrl.includes('unsplash') || b.imageUrl.includes('dummyimage')) {
      dummyImage++;
    } else {
      withImage++;
    }
  }

  console.log(`\n--- Image Summary ---`);
  console.log(`Total Businesses: ${allBusinesses.length}`);
  console.log(`With Valid/Original Image: ${withImage}`);
  console.log(`With Dummy/Unsplash Image: ${dummyImage}`);
  console.log(`Without Image (null): ${withoutImage}`);

  const kampu = await prisma.business.findFirst({
    where: { name: { contains: 'kampu', mode: 'insensitive' } }
  });

  console.log(`\n--- Kampu Status ---`);
  if (kampu) {
    console.log(`Name: ${kampu.name}`);
    console.log(`Current Image URL: ${kampu.imageUrl}`);
  } else {
    console.log(`Kampu not found.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
