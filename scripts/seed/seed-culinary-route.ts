import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const culinaryRoute = [
  { slug: 'chicha-gaston-acurio', name: 'Chicha por Gastón Acurio', loc: 'cusco', lat: -13.5186, lng: -71.9796, cat: 'Dining', tagline: 'Elevated regional cuisine by Peru\'s top chef', imageUrl: '/images/dummy/ceviche.jpg' },
  { slug: 'limbus-resto-bar', name: 'Limbus Resto Bar', loc: 'cusco', lat: -13.5140, lng: -71.9730, cat: 'Dining', tagline: 'Creative cocktails and the best view of Cusco', imageUrl: '/images/dummy/ceviche.jpg' },
  { slug: 'cicciolina', name: 'Cicciolina', loc: 'cusco', lat: -13.5159, lng: -71.9767, cat: 'Dining', tagline: 'Elegant and cozy Italian-Peruvian fusion', imageUrl: '/images/dummy/ceviche.jpg' },
  { slug: 'map-cafe', name: 'MAP Café', loc: 'cusco', lat: -13.5146, lng: -71.9754, cat: 'Dining', tagline: 'Modern gastronomy inside the Pre-Columbian Art Museum', imageUrl: '/images/dummy/ceviche.jpg' },
  { slug: 'morena-peruvian-kitchen', name: 'Morena Peruvian Kitchen', loc: 'cusco', lat: -13.5173, lng: -71.9799, cat: 'Dining', tagline: 'Vibrant, modern Peruvian cuisine', imageUrl: '/images/dummy/ceviche.jpg' },
  { slug: 'pachapapa', name: 'Pachapapa', loc: 'cusco', lat: -13.5134, lng: -71.9723, cat: 'Dining', tagline: 'Traditional Andean food in a rustic San Blas courtyard', imageUrl: '/images/dummy/ceviche.jpg' },
  { slug: 'uchu-peruvian-steakhouse', name: 'Uchu Peruvian Steakhouse', loc: 'cusco', lat: -13.5150, lng: -71.9760, cat: 'Dining', tagline: 'Alpaca and meats on hot volcanic stones', imageUrl: '/images/dummy/ceviche.jpg' },
];

async function main() {
  console.log('Seeding 7 Best Culinary Spots...');

  const createdBusinesses = new Map<string, any>();

  for (const p of culinaryRoute) {
    const existing = await prisma.business.findFirst({ where: { name: { contains: p.name } } });
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
          description: `One of the highly recommended culinary experiences in ${p.loc}.`,
          isClaimed: true,
          rating: 4.9,
          reviewsCount: 250,
          imageUrl: p.imageUrl,
        }
      });
      createdBusinesses.set(p.slug, b);
      console.log(`+ Added: ${p.name}`);
    } else {
      const b = await prisma.business.update({
        where: { id: existing.id },
        data: { lat: p.lat, lng: p.lng, tagline: p.tagline, category: p.cat }
      });
      createdBusinesses.set(p.slug, b);
      console.log(`* Updated: ${p.name}`);
    }
  }

  const getDbWp = (slug: string) => {
    const b = createdBusinesses.get(slug);
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

  const waypoints = [
    getDbWp('morena-peruvian-kitchen'),
    getDbWp('chicha-gaston-acurio'),
    getDbWp('cicciolina'),
    getDbWp('uchu-peruvian-steakhouse'),
    getDbWp('map-cafe'),
    getDbWp('limbus-resto-bar'),
    getDbWp('pachapapa')
  ].filter(w => w !== null);

  const itinerary = {
    shortId: 'top-7-culinary-route',
    state: {
      title: 'Top 7 Culinary Route in Cusco',
      startAnchor: { lat: -13.5173, lng: -71.9799, title: "Morena Peruvian Kitchen", type: "CUSTOM" },
      endAnchor: { lat: -13.5134, lng: -71.9723, title: "Pachapapa", type: "CUSTOM" },
      waypoints: waypoints
    }
  };

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

  console.log(`✅ Finished seeding culinary route.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
