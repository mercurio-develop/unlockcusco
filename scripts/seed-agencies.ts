import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Agencies and Tour Packages...");

  const jaguar = await prisma.business.upsert({
    where: { slug: 'jaguar-llaqta' },
    update: {},
    create: {
      slug: 'jaguar-llaqta',
      name: 'Jaguar Llaqta',
      description: 'Deeply rooted in the ancestral traditions of the Sacred Valley, Jaguar Llaqta offers more than just tours—we provide transformations. Led by native experts who carry the wisdom of the Quechua people.',
      locationSlug: 'pisac',
      imageUrl: '/images/boleto/pisac-ruins.jpg',
      whatsapp: '+51987654321',
      specialties: JSON.stringify(["Ancestral Wisdom", "High-Altitude Treks", "Local Textiles"]),
    }
  });

  const packages = [
    {
      businessId: jaguar.id,
      title: "Ausangate Spiritual Trek",
      description: "A 5-day journey around the sacred Apu Ausangate, visiting turquoise lagoons and high-alpine passes.",
      basePriceUsd: 650,
      sector: "OTHER",
      pace: "SLOW",
      difficulty: 'HARD',
      maxAltitude: "5200m",
      durationDays: 5,
      tags: "trek, ausangate, spiritual, high-altitude",
      included: JSON.stringify(["Private Guide", "Equipped Camping", "Horses", "Organic Meals", "Oxygen Support"]),
    },
    {
      businessId: jaguar.id,
      title: "Pisac Living Culture",
      description: "Spend a full day with the weavers of the Amaru community and explore the hidden trails of the ruins.",
      basePriceUsd: 120,
      sector: "EAST_VALLEY",
      pace: "BALANCED",
      difficulty: 'MODERATE',
      maxAltitude: "3400m",
      durationDays: 1,
      tags: "culture, weaving, pisac, ruins",
      included: JSON.stringify(["Local Expert", "Textile Workshop", "Pachamanca Lunch"]),
    }
  ];

  for (const pkg of packages) {
    await prisma.tourPackage.create({
      data: pkg
    });
  }

  console.log("Finished seeding agencies.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
