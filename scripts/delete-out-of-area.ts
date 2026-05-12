import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Deleting Out-of-Area & Broken Businesses ===")

  // 1. Delete the Miami/Florida restaurant
  const deletedFlorida = await prisma.business.deleteMany({
    where: {
      name: { contains: 'PEMBROKE PINES', mode: 'insensitive' }
    }
  })
  console.log(`Deleted ${deletedFlorida.count} businesses in Florida (Pembroke Pines).`)

  // 2. Delete businesses with empty locations
  const deletedEmpty = await prisma.business.deleteMany({
    where: {
      locationSlug: ""
    }
  })
  console.log(`Deleted ${deletedEmpty.count} businesses with missing locations.`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
