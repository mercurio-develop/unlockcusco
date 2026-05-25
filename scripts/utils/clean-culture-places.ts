import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REAL_IMAGES: Record<string, string> = {
  'Machu Picchu Citadel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/1280px-Machu_Picchu%2C_Peru.jpg',
  'San Pedro Market': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Mercado_de_San_Pedro%2C_Cuzco.jpg/1280px-Mercado_de_San_Pedro%2C_Cuzco.jpg',
  'Plaza de Armas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Cusco_Plaza_de_Armas.jpg/1280px-Cusco_Plaza_de_Armas.jpg',
  'Salineras de Maras': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Salineras_de_Maras_01.jpg/1280px-Salineras_de_Maras_01.jpg',
  'Qorikancha (Temple of the Sun)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Qorikancha_y_Convento_de_Santo_Domingo.jpg/1280px-Qorikancha_y_Convento_de_Santo_Domingo.jpg',
  'Pisac Archaeological Park': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Pisac_-_panoramio_%282%29.jpg/1280px-Pisac_-_panoramio_%282%29.jpg',
  'Pisac Artisan Market': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Pisac_market.jpg/1280px-Pisac_market.jpg',
  'Centro Textil Chinchero': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Chinchero_weavers.jpg/1280px-Chinchero_weavers.jpg'
};

const DUPLICATES_TO_DELETE = [
  'Sacsayhuaman',
  "Q'enqo",
  'Puka Pukara',
  'Tambomachay',
  'Chinchero Ruins',
  'Moray Agricultural Terraces',
  'Ollantaytambo Fortress'
];

async function main() {
  console.log('--- Cleaning Up Culture Places ---');

  // 1. Delete duplicates in Culture category (since Boleto category has the real ones)
  let deletedCount = 0;
  for (const dupName of DUPLICATES_TO_DELETE) {
    const toDelete = await prisma.business.findMany({
      where: {
        name: dupName,
        category: 'Culture'
      }
    });

    for (const record of toDelete) {
      // Re-link or delete reviews if needed before deleting the business
      await prisma.review.deleteMany({ where: { businessId: record.id } });
      await prisma.lead.deleteMany({ where: { businessId: record.id } });
      await prisma.businessService.deleteMany({ where: { businessId: record.id } });
      await prisma.tourPackage.deleteMany({ where: { businessId: record.id } });
      await prisma.businessPremiumProfile.deleteMany({ where: { businessId: record.id } });
      
      await prisma.business.delete({ where: { id: record.id } });
      console.log(`✅ Deleted duplicate: ${dupName} (Culture)`);
      deletedCount++;
    }
  }

  console.log(`\nDeleted ${deletedCount} duplicate records.`);

  // 2. Update real images for unique iconic places
  let updatedCount = 0;
  for (const [name, imageUrl] of Object.entries(REAL_IMAGES)) {
    const toUpdate = await prisma.business.findMany({
      where: { name }
    });

    for (const record of toUpdate) {
      await prisma.business.update({
        where: { id: record.id },
        data: {
          imageUrl: imageUrl,
          heroImages: JSON.stringify([imageUrl])
        }
      });
      console.log(`✅ Updated image for: ${name}`);
      updatedCount++;
    }
  }

  console.log(`\nUpdated ${updatedCount} records with real images.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
