import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching businesses with category BOLETO or related to Boleto sites...');
  
  // We fetch by category BOLETO, but let's also fetch by known names just in case
  const boletoNames = [
    "Tambomachay", "Ollantaytambo Ruins", "Moray", "Pikillaqta",
    "Monumento a Pachacutec", "Centro Qosqo de Arte Nativo",
    "Museo Historico Regional", "Sacsayhuaman", "Q'enqo",
    "Puka Pukara", "Chinchero Ruins", "Tipon",
    "Museo de Arte Contemporaneo", "Museo de Arte Popular",
    "COSITUC Ticket Office", "Museo de Sitio de Qorikancha"
  ];

  const businesses = await prisma.business.findMany({
    where: {
      OR: [
        { category: 'BOLETO' },
        { name: { in: boletoNames } }
      ]
    },
    include: {
      reviews: true // Include reviews so we don't delete the one with reviews if possible
    }
  });

  const byName: Record<string, typeof businesses> = {};
  
  for (const b of businesses) {
    if (!byName[b.name]) byName[b.name] = [];
    byName[b.name].push(b);
  }

  let deletedCount = 0;

  for (const [name, duplicates] of Object.entries(byName)) {
    if (duplicates.length > 1) {
      console.log(`\nFound ${duplicates.length} entries for "${name}":`);
      
      // Sort to prefer keeping the one with an image, or with more reviews, or the oldest
      duplicates.sort((a, b) => {
        // 1. Prefer ones with imageUrl
        if (a.imageUrl && !b.imageUrl) return -1;
        if (!a.imageUrl && b.imageUrl) return 1;
        
        // 2. Prefer ones with reviews
        if (a.reviews.length > b.reviews.length) return -1;
        if (b.reviews.length > a.reviews.length) return 1;
        
        // 3. Fallback to older created date
        return ((a as any).createdAt?.getTime() || 0) - ((b as any).createdAt?.getTime() || 0);
      });

      const [keep, ...rest] = duplicates;
      console.log(`  -> Keeping ID: ${keep.id} (Has Image: ${!!keep.imageUrl}, Reviews: ${keep.reviews.length})`);

      for (const toDelete of rest) {
        // Delete associated records first if Prisma doesn't cascade
        await prisma.review.deleteMany({ where: { businessId: toDelete.id } });
        
        await prisma.business.delete({ where: { id: toDelete.id } });
        console.log(`  -> Deleted duplicate ID: ${toDelete.id}`);
        deletedCount++;
      }
    }
  }

  console.log(`\n✅ Finished deduplication. Deleted ${deletedCount} duplicate records.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
