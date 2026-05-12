import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const idsToDelete = [
    'cmp1tz6ws00bnml2i3l588u7l', // Duplicate Ollantaytambo
    'cmp1u7c3b00ceml2iexbs45wb'  // Duplicate Chinchero
  ]

  const result = await prisma.business.deleteMany({
    where: { id: { in: idsToDelete } }
  })

  console.log(`Deleted ${result.count} final duplicate Boleto sites.`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
