import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Category Cleanup Script: Phase 2 ===")

  // 1. Move Adventure/Hiking/ATV/Tours from Culture to Adventure
  const updatedAdventure = await prisma.business.updateMany({
    where: {
      category: 'Culture',
      OR: [
        { name: { contains: 'Hike', mode: 'insensitive' } },
        { name: { contains: 'Hiking', mode: 'insensitive' } },
        { name: { contains: 'Trail', mode: 'insensitive' } },
        { name: { contains: 'Trek', mode: 'insensitive' } },
        { name: { contains: 'Quad Bike', mode: 'insensitive' } },
        { name: { contains: 'ATV', mode: 'insensitive' } },
        { name: { contains: 'Rafting', mode: 'insensitive' } },
        { name: { contains: 'Ascent', mode: 'insensitive' } },
        { name: { contains: 'Explorers', mode: 'insensitive' } },
        { name: { contains: 'Zipline', mode: 'insensitive' } }
      ]
    },
    data: { category: 'Adventure' }
  })
  console.log(`Moved ${updatedAdventure.count} Hiking/Adventure businesses from Culture to Adventure`)

  // 2. Move Hostels/Houses from Culture to Stays
  const updatedStays = await prisma.business.updateMany({
    where: {
      category: 'Culture',
      OR: [
        { name: { contains: 'Backpacker', mode: 'insensitive' } },
        { name: { contains: 'Rover', mode: 'insensitive' } },
        { name: { contains: 'Country House', mode: 'insensitive' } },
        { name: { contains: 'House', mode: 'insensitive' } } // Wiñapu House, Kuska House
      ]
    },
    data: { category: 'Stays' }
  })
  console.log(`Moved ${updatedStays.count} Hostels/Houses from Culture to Stays`)

  // 3. Move Food/Brewery from Culture to Dining
  const updatedDining = await prisma.business.updateMany({
    where: {
      category: 'Culture',
      OR: [
        { name: { contains: 'Dessert', mode: 'insensitive' } },
        { name: { contains: 'Cervecería', mode: 'insensitive' } }
      ]
    },
    data: { category: 'Dining' }
  })
  console.log(`Moved ${updatedDining.count} Food/Brewery businesses from Culture to Dining`)

  // 4. Move Wellness
  const updatedWellness = await prisma.business.updateMany({
    where: {
      category: 'Culture',
      OR: [
        { name: { contains: 'Wellness', mode: 'insensitive' } }
      ]
    },
    data: { category: 'Wellness' }
  })
  console.log(`Moved ${updatedWellness.count} Wellness businesses from Culture to Wellness`)

  // 5. Move Agencies
  const updatedAgencies = await prisma.business.updateMany({
    where: {
      category: 'Culture',
      OR: [
        { name: { contains: 'Tours', mode: 'insensitive' } },
        { name: { contains: 'Explorandes', mode: 'insensitive' } }
      ]
    },
    data: { category: 'Agency' }
  })
  console.log(`Moved ${updatedAgencies.count} Agencies from Culture to Agency`)

}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
