import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const businesses = await prisma.business.findMany({
    where: {
      locationSlug: {
        contains: 'machu',
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      name: true,
      locationSlug: true,
      category: true
    }
  })
  
  console.log(`Found ${businesses.length} businesses containing 'machu' in locationSlug:`)
  console.table(businesses)

  const allLocations = await prisma.business.groupBy({
    by: ['locationSlug'],
    _count: true
  })
  console.log("\nAll unique locationSlugs in DB:")
  console.table(allLocations)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
