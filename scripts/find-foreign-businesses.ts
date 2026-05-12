import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const businesses = await prisma.business.findMany({
    where: {
      OR: [
        { name: { contains: 'miami', mode: 'insensitive' } },
        { name: { contains: 'europe', mode: 'insensitive' } },
        { name: { contains: 'lima', mode: 'insensitive' } },
        { locationSlug: { contains: 'miami', mode: 'insensitive' } },
        { locationSlug: { contains: 'europe', mode: 'insensitive' } },
        { locationSlug: { contains: 'lima', mode: 'insensitive' } }
      ]
    },
    select: { id: true, name: true, locationSlug: true, category: true }
  })

  console.log(`\n=== Businesses matching Miami/Europe/Lima (${businesses.length}) ===`)
  businesses.forEach(b => console.log(`- [${b.category}] ${b.name} (${b.locationSlug})`))

}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
