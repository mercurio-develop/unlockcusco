import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const businesses = await prisma.business.findMany({
    where: {
      OR: [
        { description: { contains: 'miami', mode: 'insensitive' } },
        { tagline: { contains: 'miami', mode: 'insensitive' } },
        { name: { contains: 'florida', mode: 'insensitive' } },
        { description: { contains: 'florida', mode: 'insensitive' } },
        { name: { contains: 'usa', mode: 'insensitive' } },
        { name: { contains: 'europe', mode: 'insensitive' } },
        { description: { contains: 'europe', mode: 'insensitive' } },
        { name: { contains: 'lima', mode: 'insensitive' } },
        { description: { contains: 'lima', mode: 'insensitive' } },
        // Just in case check for other words in name
        { name: { contains: 'pembroke', mode: 'insensitive' } } 
      ]
    },
    select: { id: true, name: true, locationSlug: true, category: true, description: true }
  })

  console.log(`\n=== Businesses potentially matching Miami/Europe/Lima (${businesses.length}) ===`)
  businesses.forEach(b => console.log(`- [${b.category}] ${b.name} (${b.locationSlug})\n  Desc: ${b.description.substring(0, 100)}...`))

}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
