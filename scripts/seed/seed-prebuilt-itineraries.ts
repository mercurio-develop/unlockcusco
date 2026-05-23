import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const attractions = [
  // CUSCO
  { slug: 'qorikancha', name: 'Qorikancha (Temple of the Sun)', loc: 'cusco', lat: -13.5204, lng: -71.9749, cat: 'Culture', tagline: 'The most important temple in the Inca Empire', imageUrl: 'https://images.unsplash.com/photo-1590050752117-23a9d7fc6f8a?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'sacsayhuaman', name: 'Sacsayhuaman', loc: 'cusco', lat: -13.5097, lng: -71.9817, cat: 'Culture', tagline: 'Massive megalithic Inca fortress', imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'qenqo', name: 'Q\'enqo', loc: 'cusco', lat: -13.5064, lng: -71.9750, cat: 'Culture', tagline: 'Inca ceremonial site and labyrinth', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'puka-pukara', name: 'Puka Pukara', loc: 'cusco', lat: -13.4842, lng: -71.9619, cat: 'Culture', tagline: 'The Red Fortress of the Incas', imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'tambomachay', name: 'Tambomachay', loc: 'cusco', lat: -13.4797, lng: -71.9658, cat: 'Culture', tagline: 'Inca baths and water temple', imageUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'plaza-de-armas-cusco', name: 'Plaza de Armas', loc: 'cusco', lat: -13.5168, lng: -71.9781, cat: 'Culture', tagline: 'The historic main square of Cusco', imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'san-pedro-market', name: 'San Pedro Market', loc: 'cusco', lat: -13.5194, lng: -71.9839, cat: 'Culture', tagline: 'Bustling local food and goods market', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop' },

  // SACRED VALLEY - PISAC
  { slug: 'awana-kancha', name: 'Awana Kancha', loc: 'pisac', lat: -13.4566, lng: -71.8841, cat: 'Culture', tagline: 'Llama, alpaca, and vicuña sanctuary', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'pisac-market', name: 'Pisac Artisan Market', loc: 'pisac', lat: -13.4225, lng: -71.8504, cat: 'Culture', tagline: 'Famous traditional craft market', imageUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'pisac-ruins', name: 'Pisac Archaeological Park', loc: 'pisac', lat: -13.4116, lng: -71.8427, cat: 'Culture', tagline: 'Spectacular mountain terraces and citadel', imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop' },

  // SACRED VALLEY - URUBAMBA & MARAS
  { slug: 'chinchero-weavers', name: 'Centro Textil Chinchero', loc: 'chinchero', lat: -13.3934, lng: -72.0475, cat: 'Culture', tagline: 'Traditional backstrap weaving', imageUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'chinchero-ruins', name: 'Chinchero Ruins', loc: 'chinchero', lat: -13.3908, lng: -72.0461, cat: 'Culture', tagline: 'Inca palace and colonial church', imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'maras-salt-mines', name: 'Salineras de Maras', loc: 'maras', lat: -13.3033, lng: -72.1542, cat: 'Culture', tagline: 'Thousands of cascading salt pools', imageUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'moray-terraces', name: 'Moray Agricultural Terraces', loc: 'maras', lat: -13.3298, lng: -72.1974, cat: 'Culture', tagline: 'Circular Inca agricultural laboratory', imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop' },
  
  // SACRED VALLEY - OLLANTAYTAMBO
  { slug: 'ollantaytambo-ruins', name: 'Ollantaytambo Fortress', loc: 'ollantaytambo', lat: -13.2574, lng: -72.2655, cat: 'Culture', tagline: 'A living Inca town and massive fortress', imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop' },

  // MACHU PICCHU
  { slug: 'machu-picchu-llaqta', name: 'Machu Picchu Citadel', loc: 'machu-picchu', lat: -13.1631, lng: -72.5450, cat: 'Culture', tagline: 'The lost city of the Incas', imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'huayna-picchu', name: 'Huayna Picchu Mountain', loc: 'machu-picchu', lat: -13.1561, lng: -72.5456, cat: 'Culture', tagline: 'Iconic peak overlooking the ruins', imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop' },
];

async function main() {
  console.log('Seeding top attractions for pre-built itineraries...');
  
  const createdBusinesses = new Map<string, any>();

  for (const p of attractions) {
    const existing = await prisma.business.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      const b = await prisma.business.create({
        data: {
          name: p.name,
          slug: p.slug,
          locationSlug: p.loc,
          category: p.cat,
          lat: p.lat,
          lng: p.lng,
          tagline: p.tagline,
          description: `This is one of the top attractions in the ${p.loc} area. Added as part of pre-built itineraries.`,
          isClaimed: true,
          rating: 4.8,
          reviewsCount: 150,
          imageUrl: p.imageUrl,
        }
      });
      createdBusinesses.set(p.slug, b);
      console.log(`+ Added: ${p.name}`);
    } else {
      const b = await prisma.business.update({
        where: { slug: p.slug },
        data: { lat: p.lat, lng: p.lng, tagline: p.tagline, imageUrl: p.imageUrl, category: p.cat as any }
      });
      createdBusinesses.set(p.slug, b);
      console.log(`* Updated: ${p.name}`);
    }
  }

  // Helper to format a business into a waypoint
  const getWp = (slug: string) => {
    const b = createdBusinesses.get(slug);
    if (!b) throw new Error(`Business not found for slug: ${slug}`);
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

  const getDbWp = (b: any) => {
    if (!b) return null;
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

  const tunupaDb = await prisma.business.findFirst({ where: { name: { contains: 'Tunupa' } } });
  const elAlbergueDb = await prisma.business.findFirst({ where: { name: { contains: 'El Albergue' } } });
  
  const tunupaWp = tunupaDb ? getDbWp(tunupaDb) : null;
  const elAlbergueWp = elAlbergueDb ? getDbWp(elAlbergueDb) : null;

  const itineraries = [
    {
      shortId: 'cusco-city-tour',
      state: {
        title: 'Cusco Classic City Tour',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Plaza de Armas", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "Plaza de Armas", type: "CUSTOM" },
        waypoints: [
          getWp('qorikancha'),
          getWp('sacsayhuaman'),
          getWp('qenqo'),
          getWp('puka-pukara'),
          getWp('tambomachay')
        ]
      }
    },
    {
      shortId: 'classic-sacred-valley',
      state: {
        title: 'Classic Sacred Valley Full Day',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco", type: "CUSTOM" },
        endAnchor: elAlbergueDb ? { lat: elAlbergueDb.lat, lng: elAlbergueDb.lng, title: elAlbergueDb.name, type: "HOTEL", service: elAlbergueWp } : { lat: -13.2574, lng: -72.2655, title: "Ollantaytambo", type: "CUSTOM" },
        waypoints: [
          getWp('awana-kancha'),
          getWp('pisac-market'),
          getWp('pisac-ruins'),
          ...(tunupaWp ? [tunupaWp] : []),
          getWp('ollantaytambo-ruins')
        ]
      }
    },
    {
      shortId: 'maras-moray',
      state: {
        title: 'Maras, Moray & Chinchero',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco", type: "CUSTOM" },
        waypoints: [
          getWp('chinchero-weavers'),
          getWp('chinchero-ruins'),
          getWp('moray-terraces'),
          getWp('maras-salt-mines')
        ]
      }
    },
    {
      shortId: 'machu-picchu-day',
      state: {
        title: 'Machu Picchu Complete Day',
        startAnchor: { lat: -13.2574, lng: -72.2655, title: "Ollantaytambo Station", type: "CUSTOM" },
        endAnchor: { lat: -13.1547, lng: -72.5253, title: "Aguas Calientes", type: "CUSTOM" },
        waypoints: [
          getWp('machu-picchu-llaqta'),
          getWp('huayna-picchu')
        ]
      }
    },
    {
      shortId: 'coffee-cacao-route',
      state: {
        title: 'The Route of Coffee and Cacao',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco City (Depart)", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco City (Return)", type: "CUSTOM" },
        waypoints: [
          { id: 'pisonay', title: 'Pisonay Coffee Roasters', lat: -13.3333, lng: -71.9500, category: 'Dining', rating: 4.8, locationStr: 'calca' },
          { id: 'arbol', title: 'Arbol de la Vida', lat: -13.3400, lng: -72.0500, category: 'Dining', rating: 4.9, locationStr: 'huayoccari' },
          { id: 'choco', title: 'Artisan Chocolate Workshop', lat: -13.5168, lng: -71.9781, category: 'Culture', rating: 4.9, locationStr: 'cusco' }
        ]
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

  console.log(`✅ Finished seeding itineraries.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
