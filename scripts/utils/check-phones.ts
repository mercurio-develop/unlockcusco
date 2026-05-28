import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.business.count({
    where: {
      OR: [
        { whatsapp: null },
        { whatsapp: '' }
      ]
    }
  });

  const total = await prisma.business.count();
  
  console.log(`\nBusinesses without a phone number: ${count} out of ${total}`);
  
  const cultureWithoutPhone = await prisma.business.count({
    where: {
      category: 'culture',
      OR: [
        { whatsapp: null },
        { whatsapp: '' }
      ]
    }
  });
  
  console.log(`Culture businesses without a phone number: ${cultureWithoutPhone}`);
  
  const boletoDuplicates = await prisma.business.findMany({
    where: {
      category: 'culture',
    },
    select: {
      id: true,
      name: true
    }
  });
  
  const boletoPlaces = await prisma.business.findMany({
    where: {
      category: 'boleto'
    },
    select: {
      id: true,
      name: true
    }
  });
  
  const boletoNames = new Set(boletoPlaces.map(b => b.name.toLowerCase().trim()));
  
  let duplicateCount = 0;
  for (const c of boletoDuplicates) {
    if (boletoNames.has(c.name.toLowerCase().trim())) {
      duplicateCount++;
      console.log(`Found duplicate (marked as culture but exists as boleto): ${c.name}`);
    }
  }
  
  console.log(`\nTotal potential duplicates found: ${duplicateCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });