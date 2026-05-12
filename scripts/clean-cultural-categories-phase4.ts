import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Category Cleanup Script: Phase 4 ===")

  // 1. Move remaining Wellness
  const updatedWellness = await prisma.business.updateMany({
    where: {
      category: 'Culture',
      OR: [
        { name: { contains: 'Yoga', mode: 'insensitive' } },
        { name: { contains: 'Holístico', mode: 'insensitive' } },
        { name: { contains: 'Huachuma', mode: 'insensitive' } }, // San pedro retreats
        { name: { contains: 'Wasi', mode: 'insensitive' } } // Often retreats, e.g. Huachuma Wasi
      ]
    },
    data: { category: 'Wellness' }
  })
  console.log(`Moved ${updatedWellness.count} Wellness businesses from Culture to Wellness`)

  // Note: Some "Wasi" might be hostels (e.g. Ganesha Wasi). Let's check Ganesha Wasi separately
  await prisma.business.updateMany({
    where: {
      name: { contains: 'Ganesha Wasi', mode: 'insensitive' }
    },
    data: { category: 'Stays' }
  })
  
  // 2. Move Ranches to Adventure or Stays depending. We'll put them in Adventure as they usually do horseback riding.
  const updatedRanches = await prisma.business.updateMany({
    where: {
      category: 'Culture',
      OR: [
        { name: { contains: 'Ranch', mode: 'insensitive' } }
      ]
    },
    data: { category: 'Adventure' }
  })
  console.log(`Moved ${updatedRanches.count} Ranches from Culture to Adventure`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
