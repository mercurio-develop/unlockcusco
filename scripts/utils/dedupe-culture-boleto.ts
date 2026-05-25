import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching all BOLETO and CULTURE businesses...');
  
  const allBoleto = await prisma.business.findMany({
    where: { category: 'BOLETO' }
  });

  const allCulture = await prisma.business.findMany({
    where: { category: 'CULTURE' }
  });

  let deletedCount = 0;

  for (const cultureBiz of allCulture) {
    // Check if there's a BOLETO biz with the same name or very similar
    const isDuplicate = allBoleto.some(boletoBiz => {
      const name1 = boletoBiz.name.toLowerCase().trim();
      const name2 = cultureBiz.name.toLowerCase().trim();
      
      // Direct match
      if (name1 === name2) return true;
      
      // Match with/without "Ruins"
      if (name1.replace(' ruins', '') === name2.replace(' ruins', '')) return true;

      // Includes match for longer names (e.g. "Pisac" vs "Pisac Ruins")
      // Careful not to over-match short names
      if (name1.length > 5 && name2.includes(name1)) return true;
      if (name2.length > 5 && name1.includes(name2)) return true;

      return false;
    });

    if (isDuplicate) {
      console.log(`Deleting CULTURE duplicate: "${cultureBiz.name}" (ID: ${cultureBiz.id})`);
      
      // Delete reviews first if necessary
      await prisma.review.deleteMany({ where: { businessId: cultureBiz.id } });
      
      // Delete the duplicate culture business
      await prisma.business.delete({ where: { id: cultureBiz.id } });
      deletedCount++;
    }
  }

  console.log(`\n✅ Finished deduplication. Deleted ${deletedCount} CULTURE duplicate records.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
