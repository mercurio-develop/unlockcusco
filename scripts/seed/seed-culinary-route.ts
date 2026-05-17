import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const culinaryRoute = [
  { slug: 'chicha-gaston-acurio', name: 'Chicha por Gastón Acurio', loc: 'cusco', lat: -13.5186, lng: -71.9796, cat: 'Dining', tagline: 'Elevated regional cuisine by Peru\'s top chef', imageUrl: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'limbus-resto-bar', name: 'Limbus Resto Bar', loc: 'cusco', lat: -13.5140, lng: -71.9730, cat: 'Dining', tagline: 'Creative cocktails and the best view of Cusco', imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'iskay', name: 'Iskay', loc: 'pisac', lat: -13.4215, lng: -71.8490, cat: 'Dining', tagline: 'Gourmet dining and spectacular valley views', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'cerveceria-valle', name: 'Cervecería del Valle Sagrado', loc: 'urubamba', lat: -13.3134, lng: -72.1158, cat: 'Dining', tagline: 'Award-winning craft brewery on the river', imageUrl: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'tunupa-restaurant', name: 'Tunupa Restaurant Valle Sagrado', loc: 'urubamba', lat: -13.3031, lng: -72.1160, cat: 'Dining', tagline: 'Elegant buffet dining along the Urubamba river', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'mil-centro', name: 'MIL Centro', loc: 'maras', lat: -13.3290, lng: -72.1965, cat: 'Dining', tagline: 'World-class high-altitude dining experience by Virgilio Martínez', imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=1000&auto=format&fit=crop' },
  { slug: 'el-albergue-restaurant', name: 'El Albergue Restaurant', loc: 'ollantaytambo', lat: -13.2570, lng: -72.2630, cat: 'Dining', tagline: 'Farm-to-table organic dining right at the train station', imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1000&auto=format&fit=crop' },
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
        data: { lat: p.lat, lng: p.lng, tagline: p.tagline, category: p.cat, imageUrl: p.imageUrl }
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
    getDbWp('chicha-gaston-acurio'),
    getDbWp('limbus-resto-bar'),
    getDbWp('iskay'),
    getDbWp('cerveceria-valle'),
    getDbWp('tunupa-restaurant'),
    getDbWp('mil-centro'),
    getDbWp('el-albergue-restaurant')
  ].filter(w => w !== null);

  const itinerary = {
    shortId: 'top-7-culinary-route',
    state: {
      title: '7 Best Restaurants Route',
      startAnchor: { lat: -13.5186, lng: -71.9796, title: "Chicha por Gastón Acurio", type: "CUSTOM" },
      endAnchor: { lat: -13.2570, lng: -72.2630, title: "El Albergue Restaurant", type: "CUSTOM" },
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