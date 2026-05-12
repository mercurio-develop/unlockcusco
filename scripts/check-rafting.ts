import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const businesses = await prisma.business.findMany({
    where: {
      name: { contains: 'Adventure Sports', mode: 'insensitive' }
    },
    select: { id: true, name: true, locationSlug: true }
  })
  
  console.log(`Found ${businesses.length} businesses matching "Adventure Sports"`)
  businesses.forEach(b => console.log(`- ${b.name} (${b.locationSlug})`))
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
