import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.business.updateMany({
    where: {
      name: { contains: 'Huachuma Wasi', mode: 'insensitive' }
    },
    data: { category: 'Spiritual' }
  })
  console.log(`Restored ${result.count} Huachuma businesses to Spiritual.`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
