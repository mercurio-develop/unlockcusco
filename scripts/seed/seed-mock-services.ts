import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MOCK_SERVICES = [
  // Therapists
  {
    name: "_MOCK_DATA_ Alma Spa & Masajes",
    category: "Business",
    lat: -13.3050, lng: -72.1150, // Urubamba
    locationSlug: "urubamba",
    serviceZones: '["urubamba", "ollantaytambo", "yucay"]',
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800",
    rating: 4.8,
    reviewsCount: 15,
  },
  {
    name: "_MOCK_DATA_ Registros Akáshicos Cusco",
    category: "Business",
    lat: -13.5186, lng: -71.9790, // Cusco
    locationSlug: "cusco",
    serviceZones: '["cusco", "pisac"]',
    imageUrl: "https://images.unsplash.com/photo-1590483736622-39818817daaa?q=80&w=800",
    rating: 4.9,
    reviewsCount: 22,
  },
  {
    name: "_MOCK_DATA_ Sonido Sanador Pisac",
    category: "Business",
    lat: -13.4228, lng: -71.8480, // Pisac
    locationSlug: "pisac",
    serviceZones: '["pisac", "calca"]',
    imageUrl: "https://images.unsplash.com/photo-1602058474246-8805f8cc4ec2?q=80&w=800",
    rating: 5.0,
    reviewsCount: 40,
  },
  {
    name: "_MOCK_DATA_ Terapias Alternativas Kawsay",
    category: "Business",
    lat: -13.2583, lng: -72.2635, // Ollantaytambo
    locationSlug: "ollantaytambo",
    serviceZones: '["ollantaytambo", "machupicchu"]',
    imageUrl: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800",
    rating: 4.7,
    reviewsCount: 8,
  },
  {
    name: "_MOCK_DATA_ Bio-Magnetismo Valle Sagrado",
    category: "Business",
    lat: -13.3320, lng: -72.0520, // Maras (approx)
    locationSlug: "maras",
    serviceZones: '["maras", "moray", "urubamba"]',
    imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800",
    rating: 4.6,
    reviewsCount: 5,
  },
  
  // Agencies
  {
    name: "_MOCK_DATA_ Andean Expeditions",
    category: "Business",
    lat: -13.5200, lng: -71.9800, // Cusco
    locationSlug: "cusco",
    serviceZones: '["cusco", "sacred-valley", "machupicchu"]',
    imageUrl: "https://images.unsplash.com/photo-1517584144342-cb794ccb1979?q=80&w=800",
    rating: 4.9,
    reviewsCount: 120,
  },
  {
    name: "_MOCK_DATA_ Urubamba Adventure Co.",
    category: "Business",
    lat: -13.3030, lng: -72.1120, // Urubamba
    locationSlug: "urubamba",
    serviceZones: '["urubamba", "maras", "moray", "chinchero"]',
    imageUrl: "https://images.unsplash.com/photo-1533230635445-d8cf818f90dd?q=80&w=800",
    rating: 4.8,
    reviewsCount: 45,
  },
  {
    name: "_MOCK_DATA_ Pacha Trekking",
    category: "Business",
    lat: -13.4210, lng: -71.8490, // Pisac
    locationSlug: "pisac",
    serviceZones: '["pisac", "lares", "ausangate"]',
    imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800",
    rating: 4.5,
    reviewsCount: 30,
  },
  
  // Guides
  {
    name: "_MOCK_DATA_ Carlos M. - Local Historian",
    category: "Guide",
    lat: -13.2560, lng: -72.2610, // Ollantaytambo
    locationSlug: "ollantaytambo",
    serviceZones: '["ollantaytambo", "machupicchu"]',
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800",
    rating: 5.0,
    reviewsCount: 88,
  },
  {
    name: "_MOCK_DATA_ Maria T. - Agronomist Guide",
    category: "Guide",
    lat: -13.3995, lng: -72.0460, // Chinchero
    locationSlug: "chinchero",
    serviceZones: '["chinchero", "maras", "moray"]',
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800",
    rating: 4.9,
    reviewsCount: 56,
  }
];

async function main() {
  console.log("Seeding Mock Services for UI Testing...");

  for (const service of MOCK_SERVICES) {
    const slug = service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
    
    await prisma.business.upsert({
      where: { slug },
      update: {},
      create: {
        ...service,
        slug,
        category: service.category.toLowerCase(),
        whatsapp: "999888777",
      }
    });
    console.log(`Created mock service: ${service.name}`);
  }

  console.log("Finished seeding mock services.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
