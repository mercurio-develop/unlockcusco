import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Vallecito Originals...");

  // 1. Create the Vallecito Originals internal agency
  const vallecitoAgency = await prisma.business.upsert({
    where: { slug: 'vallecito-originals' },
    update: {},
    create: {
      slug: 'vallecito-originals',
      name: 'Vallecito Originals',
      description: 'Curated directly by the Vallecito team. Our signature routes optimize your biological descent and guarantee deep cultural immersion without the tourist traps.',
      locationSlug: 'urubamba',
      whatsapp: '+51 987 654 321',
      commissionRate: 0.10,
    }
  });

  const packages = [
    {
      title: "The Altitude Descent",
      sector: "EAST_VALLEY",
      pace: "SLOW",
      description: "A gentle entry into the Sacred Valley focusing on safe altitude acclimation. Visit the indigenous alpaca farms, explore the vibrant Pisac market, and enjoy easy, scenic walks to begin your Andean journey peacefully.",
      basePriceUsd: 150,
      tags: "alpacas, market, acclimation, pisac",
      businessId: vallecitoAgency.id
    },
    {
      title: "The Adrenaline Plateau",
      sector: "URUBAMBA",
      pace: "FAST",
      description: "High-octane day featuring ATV rides across the Maras plateau and extreme sightseeing of the ancient salt mines.",
      basePriceUsd: 185,
      tags: "atv, maras, moray, extreme",
      businessId: vallecitoAgency.id
    },
    {
      title: "The Deep Sanctuary",
      sector: "OTHER", // ANY isn't a valid WIZARD_SECTOR in our enum, mapping to OTHER
      pace: "SLOW",
      description: "A fully restorative day of organic farm-to-table dining, massage therapy, and wellness.",
      basePriceUsd: 220,
      tags: "wellness, massage, organic, restorative",
      businessId: vallecitoAgency.id
    },
    {
      title: "The Citadel Escrow",
      sector: "MACHU_PICCHU",
      pace: "BALANCED",
      description: "A VIP, perfectly timed expedition to the crown jewel of the Andes with panoramic train views.",
      basePriceUsd: 350,
      tags: "train, ruins, bucket-list, vip",
      businessId: vallecitoAgency.id
    },
    {
      title: "Cusco Artisanal Walk",
      sector: "CUSCO_CITY",
      pace: "BALANCED",
      description: "A guided architectural stroll through the cobblestone streets of San Blas, ending with a private coffee tasting at a local roastery.",
      basePriceUsd: 45,
      tags: "cusco, walking, san-blas, coffee",
      businessId: vallecitoAgency.id
    },
    {
      title: "The Imperial Evening",
      sector: "CUSCO_CITY",
      pace: "SLOW",
      description: "As the sun sets over the Plaza de Armas, embark on an exclusive culinary tasting menu featuring elevated Andean cuisine.",
      basePriceUsd: 120,
      tags: "cusco, culinary, dining, evening",
      businessId: vallecitoAgency.id
    },
    {
      title: "Weavers of Chinchero",
      sector: "URUBAMBA",
      pace: "SLOW",
      description: "A deeply immersive, half-day experience with the female weavers of Chinchero. Learn natural dyeing techniques and share a traditional meal.",
      basePriceUsd: 65,
      tags: "culture, textiles, chinchero, women",
      businessId: vallecitoAgency.id
    },
    {
      title: "Sacsayhuamán Deep Dive",
      sector: "CUSCO_CITY",
      pace: "BALANCED",
      description: "An intensive archaeological tour of the Sacsayhuamán fortress and Qorikancha, exploring the astronomical alignments of the Inca.",
      basePriceUsd: 75,
      tags: "ruins, history, cusco, archaeology",
      businessId: vallecitoAgency.id
    }
  ];

  for (const pkg of packages) {
    const existing = await prisma.tourPackage.findFirst({
      where: { title: pkg.title, businessId: vallecitoAgency.id }
    });

    if (existing) {
      const updated = await prisma.tourPackage.update({
        where: { id: existing.id },
        data: pkg
      });
      console.log(`Updated Vallecito Original: ${updated.title}`);
    } else {
      const created = await prisma.tourPackage.create({
        data: pkg
      });
      console.log(`Created Vallecito Original: ${created.title} (${created.id})`);
    }
  }

  console.log("Vallecito Originals seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
