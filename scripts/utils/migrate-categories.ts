import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mapping: Record<string, string> = {
  "Gastronomía": "Dining",
  "Bienestar": "Wellness",
  "Aventura": "Adventure",
  "Descanso": "Stays",
  "Cultura": "Culture",
};

async function main() {
  let updated = 0;
  for (const [oldCat, newCat] of Object.entries(mapping)) {
    const result = await prisma.business.updateMany({
      where: { category: oldCat },
      data: { category: newCat },
    });
    updated += result.count;
  }
  console.log(`✅ Normalized ${updated} categories to English.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
