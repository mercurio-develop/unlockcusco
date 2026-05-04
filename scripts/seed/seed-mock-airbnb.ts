import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MOCK_AIRBNBS = [
  {
    name: "Luxury Dome in the Mountains",
    location: "Urubamba",
    lat: -13.3050,
    lng: -72.1160,
    rating: 4.95,
    reviewsCount: 124,
    imageUrl: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Sacred Valley Treehouse Retreat",
    location: "Pisac",
    lat: -13.2990,
    lng: -71.8495,
    rating: 4.98,
    reviewsCount: 89,
    imageUrl: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Inca Ruins View Boutique Lodge",
    location: "Ollantaytambo",
    lat: -13.2580,
    lng: -72.2640,
    rating: 4.85,
    reviewsCount: 210,
    imageUrl: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Rustic Alpaca Farm Stay",
    location: "Chinchero",
    lat: -13.3935,
    lng: -72.0480,
    rating: 4.92,
    reviewsCount: 56,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
  }
];

async function main() {
  console.log("🏡 Seeding Mock Airbnbs (Fallback since Apify limit reached)...");
  let added = 0;
  let skipped = 0;

  for (const item of MOCK_AIRBNBS) {
    const exists = await prisma.business.findFirst({ where: { name: item.name } });
    if (exists) {
      console.log(`   ⏭  Skipped: ${item.name}`);
      skipped++;
      continue;
    }

    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7);

    await prisma.business.create({
      data: {
        name: item.name,
        slug,
        category: "Stays",
        lat: item.lat,
        lng: item.lng,
        rating: item.rating,
        reviewsCount: item.reviewsCount,
        imageUrl: item.imageUrl,
        heroImages: JSON.stringify([item.imageUrl]),
        whatsapp: null,
        isClaimed: false, 
        reviews: {
          create: [
            { author: "InkaPortal Concierge", rating: 5, text: "Beautiful curated Airbnb stay in the Sacred Valley." }
          ]
        }
      },
    });

    added++;
    console.log(`   ✅ Added Mock Airbnb: ${item.name}`);
  }

  console.log(`\n✨ Mock Airbnb Seeding Done. Added: ${added} | Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
