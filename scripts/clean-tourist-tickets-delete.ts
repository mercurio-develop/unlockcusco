import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.business.deleteMany({
    where: { category: 'Tourist Ticket' }
  })
  console.log(`Deleted ${result.count} stray Tourist Ticket duplicates.`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
