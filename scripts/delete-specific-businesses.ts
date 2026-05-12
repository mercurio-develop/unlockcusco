import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Deleting Specific Out-of-Area Businesses ===")

  const namesToDelete = [
    'Kusa Treks',
    'LILI SPA MASSAGE - Relaxing Massages and Tantric Rituals in Cartagena',
    'Kusikuy Peruvian Cuisine & Pisco Bar',
    'Adventure Sports Rafting Company'
  ]

  for (const name of namesToDelete) {
    const deleted = await prisma.business.deleteMany({
      where: {
        name: { equals: name, mode: 'insensitive' }
      }
    })
    console.log(`Deleted ${deleted.count} business(es) named "${name}".`)
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
