import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding more pre-built itineraries...');

  // Helper to fetch a business by its exact or partial name
  const getDbWp = async (nameKeyword: string) => {
    const b = await prisma.business.findFirst({
      where: { name: { contains: nameKeyword } }
    });
    if (!b) {
      console.warn(`⚠️ Warning: Could not find business matching "${nameKeyword}"`);
      return null;
    }
    return {
      id: b.id,
      title: b.name,
      lat: b.lat,
      lng: b.lng,
      category: b.category,
      rating: b.rating,
      locationStr: b.locationSlug,
      service: b
    };
  };

  const waypointsRuins = [
    await getDbWp('Qorikancha'),
    await getDbWp('Sacsayhuaman'),
    await getDbWp('Pisac Archaeological Park'),
    await getDbWp('Ollantaytambo Fortress'),
    await getDbWp('Machu Picchu Citadel')
  ].filter(w => w !== null);

  const waypointsArtisans = [
    await getDbWp('San Pedro Market'),
    await getDbWp('Awana Kancha'),
    await getDbWp('Pisac Artisan Market'),
    await getDbWp('Centro Textil Chinchero')
  ].filter(w => w !== null);

  const itineraries = [
    {
      shortId: 'ultimate-inca-ruins',
      state: {
        title: 'The Ultimate Inca Ruins Tour',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Plaza de Armas", type: "CUSTOM" },
        endAnchor: { lat: -13.1547, lng: -72.5253, title: "Aguas Calientes", type: "CUSTOM" },
        waypoints: waypointsRuins
      }
    }
  ];

  for (const itinerary of itineraries) {
    const existingIt = await prisma.savedItinerary.findUnique({ where: { shortId: itinerary.shortId } });
    if (!existingIt) {
      await prisma.savedItinerary.create({
        data: {
          shortId: itinerary.shortId,
          state: itinerary.state as any
        }
      });
      console.log(`+ Added Itinerary: ${itinerary.shortId}`);
    } else {
      await prisma.savedItinerary.update({
        where: { shortId: itinerary.shortId },
        data: { state: itinerary.state as any }
      });
      console.log(`* Updated Itinerary: ${itinerary.shortId}`);
    }
  }

  console.log(`✅ Finished seeding more itineraries.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());