import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up old itineraries...');

  const shortIdsToDelete = [
    'classic-sacred-valley',
    'coffee-cacao-route',
    'artisan-markets'
  ];

  for (const shortId of shortIdsToDelete) {
    try {
      const existing = await prisma.savedItinerary.findUnique({
        where: { shortId }
      });

      if (existing) {
        await prisma.savedItinerary.delete({
          where: { shortId }
        });
        console.log(`✅ Deleted itinerary: ${shortId}`);
      } else {
        console.log(`⚠️ Itinerary not found: ${shortId}`);
      }
    } catch (e) {
      console.error(`❌ Error deleting ${shortId}:`, e);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());