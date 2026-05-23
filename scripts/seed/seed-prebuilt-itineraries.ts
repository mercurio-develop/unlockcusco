import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Pre-Built Itineraries using Real Database Businesses...');

  // Helper to find the real business in the DB
  const findWp = async (query: string, fallbackLat: number, fallbackLng: number) => {
    let b = await prisma.business.findFirst({
      where: { name: { contains: query, mode: 'insensitive' } },
      orderBy: { reviewsCount: 'desc' }
    });
    
    // If not found, use a fallback structure so the map doesn't break
    if (!b) {
      console.warn(`⚠️ Warning: Could not find business matching "${query}". Using fallback map anchor.`);
      return {
        id: `fallback-${query.replace(/\s+/g, '-')}`,
        title: query,
        lat: fallbackLat,
        lng: fallbackLng,
        category: 'CUSTOM',
        rating: 4.5,
        locationStr: 'Cusco Region'
      };
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

  // Fetch all necessary waypoints
  const qorikancha = await findWp('Qorikancha', -13.5204, -71.9749);
  const sacsayhuaman = await findWp('Sacsayhuaman', -13.5097, -71.9817);
  const qenqo = await findWp("Q'enqo", -13.5064, -71.9750);
  const pukaPukara = await findWp('Puka Pukara', -13.4842, -71.9619);
  const tambomachay = await findWp('Tambomachay', -13.4797, -71.9658);
  const sanPedro = await findWp('San Pedro Market', -13.5194, -71.9839);
  
  const awanaKancha = await findWp('Awana Kancha', -13.4566, -71.8841);
  const pisacMarket = await findWp('Pisac Market', -13.4225, -71.8504);
  const pisacRuins = await findWp('Pisac Ruins', -13.4116, -71.8427);
  const chincheroWeavers = await findWp('Centro Textil', -13.3934, -72.0475);
  const chincheroRuins = await findWp('Chinchero Ruins', -13.3908, -72.0461);
  const moray = await findWp('Moray', -13.3298, -72.1974);
  const maras = await findWp('Maras', -13.3033, -72.1542);
  const ollantaytambo = await findWp('Ollantaytambo Ruins', -13.2574, -72.2655);
  
  const machuPicchu = await findWp('Machu Picchu', -13.1631, -72.5450);
  const huaynaPicchu = await findWp('Huayna Picchu', -13.1561, -72.5456);

  const mil = await findWp('MIL Centro', -13.3298, -72.1974);
  const tunupa = await findWp('Tunupa', -13.304, -72.115);
  
  const pisonay = await findWp('Pisonay', -13.3333, -71.9500);
  const arbol = await findWp('Arbol de la Vida', -13.3400, -72.0500);
  const chocoMuseo = await findWp('ChocoMuseo', -13.5168, -71.9781);

  const elAlbergueDb = await prisma.business.findFirst({ where: { name: { contains: 'El Albergue' } } });

  const itineraries = [
    {
      shortId: 'cusco-city-tour',
      state: {
        title: 'Cusco Classic City Tour',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Plaza de Armas", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "Plaza de Armas", type: "CUSTOM" },
        waypoints: [qorikancha, sacsayhuaman, qenqo, pukaPukara, tambomachay]
      }
    },
    {
      shortId: 'classic-sacred-valley',
      state: {
        title: 'Classic Sacred Valley Full Day',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco", type: "CUSTOM" },
        endAnchor: elAlbergueDb ? { lat: elAlbergueDb.lat, lng: elAlbergueDb.lng, title: elAlbergueDb.name, type: "HOTEL", service: elAlbergueDb } : { lat: -13.2574, lng: -72.2655, title: "Ollantaytambo", type: "CUSTOM" },
        waypoints: [awanaKancha, pisacMarket, pisacRuins, tunupa, ollantaytambo]
      }
    },
    {
      shortId: 'maras-moray',
      state: {
        title: 'Maras, Moray & Chinchero',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco", type: "CUSTOM" },
        waypoints: [chincheroWeavers, chincheroRuins, moray, maras]
      }
    },
    {
      shortId: 'machu-picchu-day',
      state: {
        title: 'Machu Picchu Complete Day',
        startAnchor: { lat: -13.2574, lng: -72.2655, title: "Ollantaytambo Station", type: "CUSTOM" },
        endAnchor: { lat: -13.1547, lng: -72.5253, title: "Aguas Calientes", type: "CUSTOM" },
        waypoints: [machuPicchu, huaynaPicchu]
      }
    },
    {
      shortId: 'coffee-cacao-route',
      state: {
        title: 'The Route of Coffee and Cacao',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco City (Depart)", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco City (Return)", type: "CUSTOM" },
        waypoints: [pisonay, arbol, chocoMuseo]
      }
    },
    {
      shortId: 'ultimate-inca-ruins',
      state: {
        title: 'The Ultimate Inca Ruins Tour',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco City", type: "CUSTOM" },
        endAnchor: { lat: -13.2574, lng: -72.2655, title: "Ollantaytambo", type: "CUSTOM" },
        waypoints: [sacsayhuaman, tambomachay, pisacRuins, ollantaytambo]
      }
    },
    {
      shortId: 'top-7-culinary-route',
      state: {
        title: '7 Best Restaurants Route',
        startAnchor: { lat: -13.304, lng: -72.115, title: "Urubamba", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco City", type: "CUSTOM" },
        waypoints: [mil, tunupa, sanPedro]
      }
    },
    {
      shortId: 'artisan-markets',
      state: {
        title: 'Best Artisan Markets',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco City", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco City", type: "CUSTOM" },
        waypoints: [awanaKancha, pisacMarket, chincheroWeavers, sanPedro]
      }
    }
  ];

  console.log('\nSeeding Pre-Built Itineraries...');
  for (const it of itineraries) {
    const existing = await prisma.savedItinerary.findUnique({ where: { shortId: it.shortId } });
    if (!existing) {
      await prisma.savedItinerary.create({
        data: {
          shortId: it.shortId,
          state: it.state
        }
      });
      console.log(`+ Added Itinerary: ${it.shortId}`);
    } else {
      await prisma.savedItinerary.update({
        where: { shortId: it.shortId },
        data: { state: it.state }
      });
      console.log(`* Updated Itinerary: ${it.shortId}`);
    }
  }

  console.log(`✅ Finished seeding 8 itineraries using real database businesses.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
