import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Healers (Therapists)...");

  const alma = await prisma.business.upsert({
    where: { slug: 'alma-sanadora' },
    update: {},
    create: {
      slug: 'alma-sanadora',
      name: 'Alma Sanadora',
      category: 'Wellness',
      tagline: 'Sacred Healing through Sound & Touch',
      description: 'With over 15 years of experience in the ancestral healing arts of the Andes, Alma combines modern massage therapy with ancient vibration techniques.',
      locationSlug: 'urubamba',
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800',
      heroImages: JSON.stringify(['https://images.unsplash.com/photo-1590483736622-39818817daaa?q=80&w=1200']),
      specialties: JSON.stringify(["Deep Tissue", "Sound Healing", "Registros Akáshicos", "Aromatherapy"]),
      whatsapp: '+51999888777',
      rating: 4.9,
      reviewsCount: 42,
    }
  });

  const services = [
    {
      businessId: alma.id,
      title: "Andean Deep Tissue Ritual",
      description: "A transformative physical session using local essential oils and deep pressure.",
      priceUsd: 85,
      durationMins: 90,
    },
    {
      businessId: alma.id,
      title: "Registros Akáshicos",
      description: "A deep spiritual inquiry into your soul's journey.",
      priceUsd: 120,
      durationMins: 60,
    }
  ];

  for (const s of services) {
    await prisma.businessService.create({
      data: s
    });
  }

  console.log("Finished seeding therapists.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
