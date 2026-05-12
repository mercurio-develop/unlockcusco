import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Category Cleanup Script ===")

  // 1. Unify "Tourist Ticket", "BOLETO", and "Boleto" into "Boleto"
  const updatedBoleto = await prisma.business.updateMany({
    where: { category: { in: ['Tourist Ticket', 'BOLETO'] } },
    data: { category: 'Boleto' }
  })
  console.log(`Updated ${updatedBoleto.count} businesses to "Boleto"`)

  // 2. Unify "CULTURE" into "Culture"
  const updatedCultureCase = await prisma.business.updateMany({
    where: { category: 'CULTURE' },
    data: { category: 'Culture' }
  })
  console.log(`Updated ${updatedCultureCase.count} businesses to "Culture"`)

  // 3. Move Spas, Healing, Massages from Culture to Wellness
  const updatedWellness = await prisma.business.updateMany({
    where: {
      category: 'Culture',
      OR: [
        { name: { contains: 'Spa', mode: 'insensitive' } },
        { name: { contains: 'Massage', mode: 'insensitive' } },
        { name: { contains: 'Healing', mode: 'insensitive' } },
        { name: { contains: 'Yoga', mode: 'insensitive' } },
        { name: { contains: 'Ayahuasca', mode: 'insensitive' } },
        { name: { contains: 'Retreat', mode: 'insensitive' } }
      ]
    },
    data: { category: 'Wellness' }
  })
  console.log(`Moved ${updatedWellness.count} Spa/Healing businesses from Culture to Wellness`)

  // 4. Move Hostels, Lodges from Culture to Stays
  const updatedStays = await prisma.business.updateMany({
    where: {
      category: 'Culture',
      OR: [
        { name: { contains: 'Hostel', mode: 'insensitive' } },
        { name: { contains: 'Lodge', mode: 'insensitive' } },
        { name: { contains: 'Hotel', mode: 'insensitive' } },
        { name: { contains: 'B&B', mode: 'insensitive' } }
      ]
    },
    data: { category: 'Stays' }
  })
  console.log(`Moved ${updatedStays.count} Hostels/Lodges from Culture to Stays`)

  // 5. Move Ruins and Archaeological Sites to Boleto
  const updatedRuins = await prisma.business.updateMany({
    where: {
      category: 'Culture',
      OR: [
        { name: { contains: 'Ruins', mode: 'insensitive' } },
        { name: { contains: 'Archaeological', mode: 'insensitive' } },
        { name: { contains: 'Arqueológico', mode: 'insensitive' } },
        { name: { contains: 'Ruinas', mode: 'insensitive' } }
      ]
    },
    data: { category: 'Boleto' }
  })
  console.log(`Moved ${updatedRuins.count} Ruins/Archaeological Sites from Culture to Boleto`)

  // 6. Move Cafe/Restaurant from Culture to Dining
  const updatedDining = await prisma.business.updateMany({
    where: {
      category: 'Culture',
      OR: [
        { name: { contains: 'Restaurant', mode: 'insensitive' } },
        { name: { contains: 'Cafe', mode: 'insensitive' } },
        { name: { contains: 'Café', mode: 'insensitive' } },
        { name: { contains: 'Brewbar', mode: 'insensitive' } },
        { name: { contains: 'Cuisine', mode: 'insensitive' } }
      ]
    },
    data: { category: 'Dining' }
  })
  console.log(`Moved ${updatedDining.count} Cafes/Restaurants from Culture to Dining`)
  
  // 7. Move Alpaca/Textile shops to Textiles
  const updatedTextiles = await prisma.business.updateMany({
    where: {
      category: 'Culture',
      OR: [
        { name: { contains: 'Alpaca', mode: 'insensitive' } },
        { name: { contains: 'Loom', mode: 'insensitive' } },
        { name: { contains: 'Textile', mode: 'insensitive' } },
        { name: { contains: 'Weaving', mode: 'insensitive' } },
        { name: { contains: 'Tejido', mode: 'insensitive' } }
      ]
    },
    data: { category: 'Textiles' }
  })
  console.log(`Moved ${updatedTextiles.count} Alpaca/Textile shops from Culture to Textiles`)

}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
