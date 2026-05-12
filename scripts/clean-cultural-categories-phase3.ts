import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Category Cleanup Script: Phase 3 ===")

  // 1. Move Museums and remaining Archaeological Sites to Boleto
  const updatedBoleto = await prisma.business.updateMany({
    where: {
      category: 'Culture',
      OR: [
        { name: { contains: 'Museo', mode: 'insensitive' } },
        { name: { contains: 'Museum', mode: 'insensitive' } },
        { name: { contains: 'Archaeological', mode: 'insensitive' } },
        { name: { contains: 'Sacred Rock', mode: 'insensitive' } },
        { name: { contains: 'Phuyupatamarka', mode: 'insensitive' } }
      ]
    },
    data: { category: 'Boleto' }
  })
  console.log(`Moved ${updatedBoleto.count} Museums/Sites from Culture to Boleto`)

  // 2. Move remaining Adventure / Equipment
  const updatedAdventure = await prisma.business.updateMany({
    where: {
      category: 'Culture',
      OR: [
        { name: { contains: 'Adventure', mode: 'insensitive' } },
        { name: { contains: 'Horseback', mode: 'insensitive' } },
        { name: { contains: 'Camping', mode: 'insensitive' } },
        { name: { contains: 'Vertigo', mode: 'insensitive' } },
        { name: { contains: 'Path to Machu Picchu', mode: 'insensitive' } },
        { name: { contains: 'Footpath', mode: 'insensitive' } }
      ]
    },
    data: { category: 'Adventure' }
  })
  console.log(`Moved ${updatedAdventure.count} Adventure/Equipment businesses from Culture to Adventure`)
  
  // 3. Any straggler Cervecerias
  const updatedDining = await prisma.business.updateMany({
    where: {
      category: 'Culture',
      OR: [
        { name: { contains: 'Cervecer', mode: 'insensitive' } } // Captures Cerveceria and Cervecería
      ]
    },
    data: { category: 'Dining' }
  })
  console.log(`Moved ${updatedDining.count} Brewery businesses from Culture to Dining`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
