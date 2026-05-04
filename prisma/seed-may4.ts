import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding mock businesses for May 4 MVP Polish...')

  // 1. Restaurant 1
  await prisma.business.upsert({
    where: { slug: 'mil-centro' },
    update: {},
    create: {
      slug: 'mil-centro',
      name: 'Mil Centro',
      category: 'Dining',
      lat: -13.3297,
      lng: -72.1963,
      scoreQuality: 29,
      scoreVibe: 28,
      scoreService: 27,
      editorialSummary: "A breathtaking high-altitude culinary experience by Virgilio Martínez, overlooking the Moray ruins. Diners praise the 'unforgettable' 8-course tasting menu that highlights 'hyper-local Andean ingredients'.",
      editorialCategory: 'High-Altitude Fine Dining',
      priceEstimate: '$$$ (S/ 600+)',
      operatingHours: 'Tue-Sun 12:00 PM - 3:00 PM (By reservation only)',
      contactPhone: '+51 999 888 777',
      imageUrl: '/images/dummy/mil.jpg',
      locationSlug: 'Moray',
      isClaimed: true,
    }
  })

  // 2. Restaurant 2
  await prisma.business.upsert({
    where: { slug: 'el-huerto' },
    update: {},
    create: {
      slug: 'el-huerto',
      name: 'El Huerto',
      category: 'Dining',
      lat: -13.3051,
      lng: -72.1158,
      scoreQuality: 24,
      scoreVibe: 26,
      scoreService: 23,
      editorialSummary: "A serene farm-to-table retreat set within beautiful gardens. Guests love the 'freshly harvested salads' and the 'peaceful riverside setting', making it an ideal lunch stop after exploring Urubamba.",
      editorialCategory: 'Farm-to-Table',
      priceEstimate: '$$ (S/ 40-70)',
      operatingHours: 'Daily 11:30 AM - 9:00 PM',
      contactPhone: '+51 999 111 222',
      imageUrl: '/images/dummy/huerto.jpg',
      locationSlug: 'Urubamba',
      isClaimed: false,
    }
  })

  // 3. Lodging 1
  await prisma.business.upsert({
    where: { slug: 'tambo-del-inka' },
    update: {},
    create: {
      slug: 'tambo-del-inka',
      name: 'Tambo del Inka',
      category: 'Stays',
      lat: -13.3039,
      lng: -72.1152,
      scoreQuality: 28,
      scoreVibe: 27,
      scoreService: 29,
      editorialSummary: "A spectacular luxury collection resort boasting a private train station to Machu Picchu. The 'impeccable service' and 'stunning riverside pool' make it a favorite for travelers seeking absolute comfort in the valley.",
      editorialCategory: 'Luxury Resort',
      priceEstimate: '$$$ ($350+/night)',
      operatingHours: '24/7 Front Desk',
      contactPhone: '+51 84 581777',
      imageUrl: '/images/dummy/tambo.jpg',
      locationSlug: 'Urubamba',
      isClaimed: true,
    }
  })

  // 4. Lodging 2
  await prisma.business.upsert({
    where: { slug: 'las-qolqas' },
    update: {},
    create: {
      slug: 'las-qolqas',
      name: 'Las Qolqas Eco Resort',
      category: 'Stays',
      lat: -13.2584,
      lng: -72.2635,
      scoreQuality: 26,
      scoreVibe: 29,
      scoreService: 25,
      editorialSummary: "An exquisite eco-glamping experience blending seamlessly with nature. Reviewers highlight the 'magical heated tents' and the 'deeply restorative' outdoor spa under the stars.",
      editorialCategory: 'Eco Glamping',
      priceEstimate: '$$ ($150-250/night)',
      operatingHours: '24/7 Front Desk',
      contactPhone: '+51 987 654 321',
      imageUrl: '/images/dummy/qolqas.jpg',
      locationSlug: 'Ollantaytambo',
      isClaimed: false,
    }
  })

  console.log('Seeding complete.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
