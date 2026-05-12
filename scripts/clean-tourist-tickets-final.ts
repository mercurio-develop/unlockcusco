import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const updated = await prisma.business.updateMany({
    where: { category: 'Tourist Ticket' },
    data: { category: 'Boleto' }
  })
  console.log(`Moved ${updated.count} remaining Tourist Tickets to Boleto.`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
