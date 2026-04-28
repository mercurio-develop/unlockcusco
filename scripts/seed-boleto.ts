import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BOLETO_PLACES = [
  { name: "Sacsayhuaman", lat: -13.5097, lng: -71.9817, type: "Archaeological Site" },
  { name: "Q'enqo", lat: -13.5095, lng: -71.9686, type: "Archaeological Site" },
  { name: "Puka Pukara", lat: -13.4833, lng: -71.9619, type: "Archaeological Site" },
  { name: "Tambomachay", lat: -13.4797, lng: -71.9667, type: "Archaeological Site" },
  { name: "Pisac Ruins", lat: -13.4075, lng: -71.8419, type: "Archaeological Site" },
  { name: "Ollantaytambo Ruins", lat: -13.2566, lng: -72.2644, type: "Archaeological Site" },
  { name: "Chinchero Ruins", lat: -13.3930, lng: -72.0478, type: "Archaeological Site" },
  { name: "Moray", lat: -13.3297, lng: -72.1975, type: "Archaeological Site" },
  { name: "Tipon", lat: -13.5694, lng: -71.7828, type: "Archaeological Site" },
  { name: "Pikillaqta", lat: -13.6133, lng: -71.7167, type: "Archaeological Site" },
  { name: "Monumento a Pachacutec", lat: -13.5322, lng: -71.9569, type: "Monument" },
  { name: "Centro Qosqo de Arte Nativo", lat: -13.5221, lng: -71.9796, type: "Culture" },
  { name: "Museo Historico Regional", lat: -13.5173, lng: -71.9803, type: "Museum" },
  { name: "Museo de Arte Contemporaneo", lat: -13.5165, lng: -71.9794, type: "Museum" },
  { name: "Museo de Arte Popular", lat: -13.5178, lng: -71.9782, type: "Museum" },
  { name: "Museo de Sitio de Qorikancha", lat: -13.5204, lng: -71.9754, type: "Museum" },
  { name: "COSITUC Ticket Office (Av. El Sol)", lat: -13.5218, lng: -71.9750, type: "Ticket Office" }
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop";

async function main() {
  console.log("🎟️ Seeding Boleto Turistico places...");
  
  let added = 0;
  let skipped = 0;

  for (const place of BOLETO_PLACES) {
    const slug = place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7);
    
    // Check if exists
    const exists = await prisma.business.findFirst({
      where: { name: place.name }
    });

    if (exists) {
      console.log(`⏭️ Skipped: ${place.name} (already exists)`);
      skipped++;
      continue;
    }

    await prisma.business.create({
      data: {
        name: place.name,
        slug,
        category: "Boleto", // Special Boleto category
        lat: place.lat,
        lng: place.lng,
        rating: 4.8, // Arbitrary high rating for official sites
        reviewsCount: 500,
        imageUrl: FALLBACK_IMAGE,
        whatsapp: null,
        isClaimed: true, // Official government sites
        reviews: {
          create: [
             { author: "Vallecito", rating: 5, text: "Official site included in the Boleto Turístico." }
          ]
        }
      }
    });

    console.log(`✅ Added: ${place.name}`);
    added++;
  }

  console.log(`\n✨ Done. Added: ${added} | Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
