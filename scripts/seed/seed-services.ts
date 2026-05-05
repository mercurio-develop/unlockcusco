import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FAKE_SERVICES = [
  {
    name: "Inka Trail Experts",
    category: "Guide",
    rating: 4.9,
    reviewsCount: 120,
    imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop",
    serviceZones: JSON.stringify(["cusco", "urubamba", "pisac", "ollantaytambo"]),
    marginTier: "PREMIUM",
    isClaimed: true,
    whatsapp: "51999999999"
  },
  {
    name: "Sacred Valley Guides",
    category: "Guide",
    rating: 4.7,
    reviewsCount: 85,
    imageUrl: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1000&auto=format&fit=crop",
    serviceZones: JSON.stringify(["urubamba", "pisac", "chinchero"]),
    marginTier: "STANDARD",
    isClaimed: false,
    whatsapp: null
  },
  {
    name: "Andean Wellness Spa",
    category: "Therapy",
    rating: 5.0,
    reviewsCount: 45,
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1000&auto=format&fit=crop",
    serviceZones: JSON.stringify(["cusco", "urubamba"]),
    marginTier: "LUXURY",
    isClaimed: true,
    whatsapp: "51988888888"
  },
  {
    name: "Pachamama Massage Therapy",
    category: "Therapy",
    rating: 4.8,
    reviewsCount: 60,
    imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1000&auto=format&fit=crop",
    serviceZones: JSON.stringify(["pisac"]),
    marginTier: "STANDARD",
    isClaimed: false,
    whatsapp: null
  },
  {
    name: "Cusco City Tours",
    category: "Guide",
    rating: 4.6,
    reviewsCount: 200,
    imageUrl: "https://images.unsplash.com/photo-1511216113906-8f56bbce1693?q=80&w=1000&auto=format&fit=crop",
    serviceZones: JSON.stringify(["cusco"]),
    marginTier: "STANDARD",
    isClaimed: true,
    whatsapp: "51977777777"
  }
];

async function main() {
  console.log("🌿 Seeding Fake Services (Guides & Therapists)...");
  
  let added = 0;
  let skipped = 0;

  for (const service of FAKE_SERVICES) {
    const slug = service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7);
    
    // Check if exists
    const exists = await prisma.business.findFirst({
      where: { name: service.name }
    });

    if (exists) {
      console.log(`⏭️ Skipped: ${service.name} (already exists)`);
      skipped++;
      continue;
    }

    await prisma.business.create({
      data: {
        name: service.name,
        slug,
        category: service.category,
        lat: null, // Services don't strictly need a central pin, they have zones
        lng: null,
        rating: service.rating,
        reviewsCount: service.reviewsCount,
        imageUrl: service.imageUrl,
        whatsapp: service.whatsapp,
        isClaimed: service.isClaimed,
        serviceZones: service.serviceZones,
        marginTier: service.marginTier,
        reviews: {
          create: [
             { author: "Test User", rating: service.rating, text: "Excellent service!" }
          ]
        }
      }
    });

    console.log(`✅ Added: ${service.name}`);
    added++;
  }

  console.log(`\n✨ Done. Added: ${added} | Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
