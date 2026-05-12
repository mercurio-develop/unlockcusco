import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const cultureBusinesses = await prisma.business.findMany({
    where: { category: 'Culture' },
    orderBy: { name: 'asc' },
    select: { name: true, locationSlug: true }
  })

  console.log(`\n=== Remaining 'Culture' Businesses (${cultureBusinesses.length}) ===\n`)
  cultureBusinesses.forEach(b => console.log(`- ${b.name} (${b.locationSlug})`))

}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
