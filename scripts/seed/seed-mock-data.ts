import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

const TOWNS = [
  { name: 'Urubamba',      slug: 'urubamba',      lat: -13.3047, lng: -72.1167 },
  { name: 'Pisac',         slug: 'pisac',         lat: -13.4225, lng: -71.8488 },
  { name: 'Ollantaytambo', slug: 'ollantaytambo', lat: -13.2570, lng: -72.2630 },
  { name: 'Chinchero',     slug: 'chinchero',     lat: -13.3864, lng: -72.0428 },
  { name: 'Maras',         slug: 'maras',         lat: -13.3350, lng: -72.1600 },
  { name: 'Calca',         slug: 'calca',         lat: -13.3342, lng: -71.9539 },
  { name: 'Cusco',         slug: 'cusco',         lat: -13.5226, lng: -71.9673 },
]

const CATEGORIES = [
  { name: 'Coffee',   slug: 'coffee',   type: 'place',   category: 'Dining' },
  { name: 'Food',     slug: 'food',     type: 'place',   category: 'Dining' },
  { name: 'Textiles', slug: 'textiles', type: 'place',   category: 'Culture' },
  { name: 'Massage',  slug: 'massage',  type: 'place',   category: 'Wellness' },
  { name: 'Taxi',     slug: 'taxi',     type: 'service', category: 'Taxi' },
]

// Spread them slightly around the town center
function jitter(coord: number) {
  return coord + (Math.random() - 0.5) * 0.005;
}

async function main() {
  console.log("Seeding mock data for all towns...")

  for (const town of TOWNS) {
    for (const cat of CATEGORIES) {
      const bName = `${town.name} ${cat.name} _MOCK_DATA`
      const bSlug = `${town.slug}-${cat.slug}-mock`
      
      const exists = await prisma.business.findUnique({ where: { slug: bSlug } })
      if (exists) continue

      const lat = cat.type === 'place' ? town.lat + (Math.random() - 0.5) * 0.005 : null;
      const lng = cat.type === 'place' ? town.lng + (Math.random() - 0.5) * 0.005 : null;

      await prisma.business.create({
        data: {
          name: bName,
          slug: bSlug,
          category: cat.category,
          locationSlug: town.slug,
          lat: lat,
          lng: lng,
          rating: 4.0 + Math.random(), // 4.0 to 5.0
          reviewsCount: Math.floor(Math.random() * 100) + 10,
          imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop",
          serviceZones: cat.type === 'service' ? JSON.stringify([town.slug]) : "[]"
        }
      })
      console.log(`Created: ${bName}`)
    }
  }

  console.log("Mock data seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
