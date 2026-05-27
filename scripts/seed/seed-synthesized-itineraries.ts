import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Synthesized Itineraries...');

  // Helper to strictly find existing businesses
  const findWpStrict = async (query: string) => {
    const b = await prisma.business.findFirst({
      where: { name: { equals: query, mode: 'insensitive' } },
    });
    
    if (!b) {
      throw new Error(`CRITICAL: Could not find business matching "${query}". Waypoints must strictly match existing DB entries.`);
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

  const culinaryStop1 = await findWpStrict("Limbus Resto Bar");
  const culinaryStop2 = await findWpStrict("San Pedro Market");
  const historyStop1 = await findWpStrict("Qorikancha (Temple of the Sun)");
  const historyStop2 = await findWpStrict("Sacsayhuaman");
  const adventureStop1 = await findWpStrict("Salineras de Maras");
  const adventureStop2 = await findWpStrict("Moray Archaeological Zone");
  const wellnessStop1 = await findWpStrict("Healing Tree Center");
  const wellnessStop2 = await findWpStrict("Munay Sonqo Retreat and Yoga Center");

  const itineraries = [
    {
      shortId: 'synthesized-culinary-tour',
      state: {
        title: 'Cusco Culinary Journey',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Plaza de Armas", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "Plaza de Armas", type: "CUSTOM" },
        waypoints: [culinaryStop1, culinaryStop2]
      }
    },
    {
      shortId: 'synthesized-history-walk',
      state: {
        title: 'Historical Inca Walk',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco", type: "CUSTOM" },
        waypoints: [historyStop1, historyStop2]
      }
    },
    {
      shortId: 'synthesized-adventure',
      state: {
        title: 'Sacred Valley Adventure',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco", type: "CUSTOM" },
        waypoints: [adventureStop1, adventureStop2]
      }
    },
    {
      shortId: 'synthesized-wellness',
      state: {
        title: 'Andean Wellness & Healing',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "San Blas", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "San Blas", type: "CUSTOM" },
        waypoints: [wellnessStop1, wellnessStop2]
      }
    }
  ];

  for (const it of itineraries) {
    const existing = await prisma.savedItinerary.findUnique({ where: { shortId: it.shortId } });
    if (!existing) {
      await prisma.savedItinerary.create({
        data: { shortId: it.shortId, state: it.state as any }
      });
      console.log(`+ Added Itinerary: ${it.shortId}`);
    } else {
      await prisma.savedItinerary.update({
        where: { shortId: it.shortId },
        data: { state: it.state as any }
      });
      console.log(`* Updated Itinerary: ${it.shortId}`);
    }
  }

  console.log(`✅ Finished seeding synthesized itineraries.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
