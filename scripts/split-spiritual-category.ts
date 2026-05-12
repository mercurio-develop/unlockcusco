import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Migrating Retreats to Spiritual Category ===")

  const keywords = [
    'retreat', 'ashram', 'ayahuasca', 'san pedro', 
    'huachuma', 'shaman', 'sanctuary', 'healing center'
  ]

  const orConditions = keywords.map(kw => ({
    name: { contains: kw, mode: 'insensitive' } as const
  }))

  const result = await prisma.business.updateMany({
    where: {
      category: { in: ['Wellness', 'Culture'] },
      OR: orConditions
    },
    data: {
      category: 'Spiritual'
    }
  })

  console.log(`Moved ${result.count} businesses to the 'Spiritual' category.`)
  
  // Explicitly move Willka T'ika, Samadhi, and Munay Sonqo if they weren't caught
  const specific = await prisma.business.updateMany({
    where: {
      name: { in: ["Willka T'ika", "Samadhi Sacred Valley", "Munay Sonqo"], mode: 'insensitive' }
    },
    data: {
      category: 'Spiritual'
    }
  })
  
  console.log(`Moved ${specific.count} specific top-tier centers to 'Spiritual'.`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
